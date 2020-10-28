
const { Articles, Comments, LikeVote } = require('../../db/models');
const { ObjectID } = require('mongodb');

const urlMetadata = require('url-metadata')
const { Poll } = require('../../db/models/poll.model');
const { Hashtags } = require('../../db/models/hashtags.model');
const { v1: uuidv1 } = require('uuid');
const moment = require('moment');
const { modelMap } = require('../../config/constants');

async function formatComment(comment) {
    let newComment = '';
    const arrComment = comment.split(" ");
    for (var i=0; i < arrComment.length; i++) {
        const word = arrComment[i];
        if (word.match(/#[^\s]*/gmi)) {
            const tag = word.split("#")[1];

            await Hashtags.updateOne(
                {hashtag: tag},
                {$set: {
                    hashtag: tag
                }},
                {$upset: true}
            ).exec()
            .catch(err=> {console.log(err)})
    
            newComment += `<a class="hash" href='/search=${tag}'>${word}</a> `;
        }else if (word.match(/@[^\s]*/gmi)) {
            const user = word.split('@')[1];
            newComment +=  `<a class="hash" href='/p/${user}'>${word}</a> `;
        }else if (word.match(/\^[^\s]*/gmi)){
            newComment += ' __ '
        } else {
            newComment += `${word} `
        }
        
    }  
    return newComment
}

function submitNewArticle(req, res) {
    const bodyTag = req.body;
    Articles.updateOne(
        { url: bodyTag['url'] },
        {
            $set: {
                ...bodyTag,
                _submitUserId: req.user_id,
                submittedDate: new Date(),
                searchId: moment().format('DD-MM-YY') + '-'+ uuidv1().slice(0,5)
            }
        },
        { upsert: true }
    ).then(async (result) => {
        if (result['ok'] && result['upserted']) {
            // broken for neutral
            await Poll.updateOne(
                {articleId: ObjectID(result['upserted'][0]['_id']), _submitUserId: ObjectID(req.user_id)},
                {
                    $set: {
                        real: bodyTag['real'],
                        submittedDate: new Date(),
                        _submitUserId: ObjectID(req.user_id),
                        articleId: ObjectID(result['upserted'][0]['_id'])
                    }
                },
                { upsert: true}
            ).exec()
            .catch(err => {
                console.log(err)
            })

            // reformat text, to remove url and add link to mentions
            const comment = await formatComment(bodyTag['comment']);

            if (comment !== '' || comment !== "  __ ") {
                await Comments.updateOne(
                    {articleId: ObjectID(result['upserted'][0]['_id']), _userId: ObjectID(req.user_id)},
                    {
                        $set: {
                            reply: comment,
                            submittedDate: new Date(),
                            _userId: ObjectID(req.user_id),
                            articleId: ObjectID(result['upserted'][0]['_id'])
                        }
                    },
                    { upsert: true}
                ).exec()
                .catch(err => {
                    console.log(err)
                })
            }
            res.send(result);
            return
        }
        res.send({});
        return 
    }).catch(err => res.status(403).json({ success: false, message: err }));
}

function getArticleId(req, res) {
    let id = req.query;
    // this gets specific article Id for each box article

    // 1. missing seo tags for some websites
    // 2. get youtube seo tags
    // 3. vimeo, pinterest, Periscope,
    // 4. blacklist: ['tiktok','twitter'    ]
    if (typeof(id['id']) !== 'undefined') {
        Articles.findOne({_id: id['id'] }).then(response => {
        urlMetadata(response['url']).then((metadata) => {
            res.send(metadata)
        }).catch(err => res.status(403).json({ success: false, message: err }));
    }).catch(err => res.status(403).json({ success: false, message: err }));
    } else {
        res.send({})
    }
}

async function getTopComment(req, res) {
    const likes = await Comments.aggregate([
        { $match: { articledId: ObjectID(req.query['articleId'])}},
        { $group: { _id: null, total: {$sum: 1} }},
        { $sort: { "total": -1 } },
        { $limit: 1 },
    ]).exec()
    .catch(err => console.log(err))

    if (likes.length > 0) {
        res.send({...likes, type: 'top'})
        return
    } else {
        const com = await Comments.aggregate([
            {$match: { articleId: ObjectID(req.query['articleId'])  }},
            { $sort: { submittedDate : -1 } },
            { $limit: 1 },
            {
                $lookup: {
                        from: "users",
                        localField: "_id.id",
                        foreignField: "_userId.id",
                        as: "user"
                },
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {   // does requested user like this user's comment
                $lookup: {
                    from: "likevotes",
                    let: { "commentId": "$_id" },
                    pipeline: [
                        {"$match": {
                            "$and": [
                                {"$expr":{"$eq":["$$commentId","$commentId"]}},
                                {"_submitUserId": ObjectID(req.query['uid']) }
                            ]
                        }},
                      ],
                    as: "likes"
                }
            },
            {
                $project: {
                    "_id": 1,
                    "reply": 1,
                    "submittedDate": 1,
                    "user._id": 1,
                    "user.handle": 1,
                    "user.displayname": 1,
                    "user.photoUrl": 1,
                    "likes": { "$arrayElemAt": [ "$likes", 0 ] } 
                }
            },
            {
                $group: {
                    _id: "$_id",
                    user: {
                        $first: "$user",
                    },
                    reply: {$first: "$reply"},
                    likes: {
                        $first: "$likes.response"
                    },
                }
            },
        ]).exec()
        .catch(err => {
            console.log("error", err)
        })

        console.log(com)
        if (!!com[0]) {
            res.send({...com[0], type:'latest'})
        } else {
            res.send({success: true, message: [] })
        }
    }
}

function getArticleTally(req, res) {
    const articleId = req.query['articleId']
    Poll.aggregate([
        {$match: {"articleId": ObjectID(articleId) }},
        {
            $group: { 
                _id: "$real", 
                count: { "$sum": 1}
            }
        },
        { "$group": {
            "_id": null,
                "counts": {
                    "$push": {
                    "k": "$_id",
                    "v": "$count"
                    }
                }
            } },
            { "$replaceRoot": {
                "newRoot": { "$arrayToObject": "$counts" }
        }}
    ])
    .then(result =>{
        res.send(result[0])
    }).catch(error =>{
        res.status(403).json({ success: false, message: error })
    })
}

function submitVote(req, res) {
    const info = req.body;
    Poll.findOneAndUpdate(
        {articleId: ObjectID(info['articleId']), _submitUserId: ObjectID(req.user_id)},
        { $set: {
            articleId: ObjectID(info['articleId']), 
            _submitUserId: ObjectID(req.user_id), 
            real: info['real'],
            submittedDate: new Date()
            }
        },
        {upsert: true, new: true })
        .then(result =>{
            res.status(200).send(result)
    }).catch(error => {
        res.status(403).json({ success: false, message: error })
    })
}

async function getMyVoteId(req, res) {
    const info = req.query['articleId'];
    const result = await Poll.findOne(
        {articleId: ObjectID(info), _submitUserId: ObjectID(req.user_id)}
    ).exec()
    .catch(err => {console.log(err)});
    res.status(200).send(result);
}

function latestArticle(req, res) {
    const page = req.query.page;
    const limit = 10;
    Articles.find()
    .skip(Number(page*limit))
    .limit(limit)
    .sort({submittedDate: -1})
    .then(results=> {
        res.send(results);
    }).catch(err => {
        res.status(403).json({ success: false, message: err })
    });
}

function getSearch(req, res) {
    const model = req.query.type;
    const searchId = req.query.searchId;
    const limit = req.query.limit || 1;

    modelMap[model].find(
        {searchId}
    ).limit(limit)
    .sort({submittedDate: -1})
    .then(results => {
        res.send(results)
    })
    .catch(err=> {
        res.status(403).json({ success: false, massage:err })
    })
}

async function allComments(req, res) {
    const articleObj = await Articles.findOne({
        searchId: req.query['searchId']
    }).exec()
    .catch(err=> {console.log(err)})
    const page_ = req.query['page'] || 0;
    const limit_ = 20;
    
    const likedComments = await Comments.aggregate([
        {$match: { articleId: ObjectID(articleObj._id)  }},
            { $sort: { submittedDate : -1 } },
            { $skip: page_ * limit_}, 
            {
                $lookup: {
                        from: "users",
                        localField: "_id.id",
                        foreignField: "_userId.id",
                        as: "user"
                },
            },
            {$unwind: "$user"},
            {
                $project: {
                    "reply": 1,
                    "submittedDate": 1,
                    "user.handle": 1,
                    "user.displayname": 1
                }
            }
    ]).exec()
    .catch(err=> {
        res.status(403).json({ success: false, massage:err })
    })
    res.send(likedComments)
}

module.exports = {
    submitNewArticle,
    latestArticle,
    getArticleId,
    getTopComment,
    submitVote,
    getMyVoteId,
    getArticleTally,
    getSearch,
    allComments
}