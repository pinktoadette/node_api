
const { Articles, Comments, LikeVote } = require('../../db/models');
const { ObjectID } = require('mongodb');

const urlMetadata = require('url-metadata')
const { Poll } = require('../../db/models/poll.model');
const { v1: uuidv1 } = require('uuid');
const moment = require('moment');
const { modelMap } = require('../../config/constants');
const { formatComment } = require('../helper')


function submitNewArticle(req, res) {
    const bodyTag = req.body;
    Articles.updateOne(
        { url: bodyTag['url'] },
        {
            $set: {
                ...bodyTag,
                _submitUserId: req.user_id,
                submittedDate: new Date(),
                searchId: moment().format('DD-MM-YY') + '-' + uuidv1().slice(0, 5)
            }
        },
        { upsert: true }
    ).then(async (result) => {
        if (result['ok'] && result['upserted']) {
            // broken for neutral
            await Poll.updateOne(
                { articleId: ObjectID(result['upserted'][0]['_id']), _submitUserId: ObjectID(req.user_id) },
                {
                    $set: {
                        real: bodyTag['real'],
                        submittedDate: new Date(),
                        _submitUserId: ObjectID(req.user_id),
                        articleId: ObjectID(result['upserted'][0]['_id'])
                    }
                },
                { upsert: true }
            ).exec()
                .catch(err => {
                    console.log(err)
                })

            // reformat text, to remove url and add link to mentions
            const comment = await formatComment(bodyTag['comment']);

                await Comments.updateOne(
                    { articleId: ObjectID(result['upserted'][0]['_id']), _userId: ObjectID(req.user_id) },
                    {
                        $set: {
                            reply: comment,
                            submittedDate: new Date(),
                            _userId: ObjectID(req.user_id),
                            articleId: ObjectID(result['upserted'][0]['_id'])
                        }
                    },
                    { upsert: true }
                ).exec()
                    .catch(err => {
                        console.log(err)
                    })
            
            res.send(result);
            return
        }
    }).catch(err => res.status(403).json({ success: false, message: err }));
}

function getArticleId(req, res) {
    let id = req.query;
    // this gets specific article Id for each box article

    // 1. missing seo tags for some websites
    // 2. get youtube seo tags
    // 3. vimeo, pinterest, Periscope,
    // 4. blacklist: ['tiktok','twitter'    ]
    if (typeof (id['id']) !== 'undefined') {
        Articles.findOne({ _id: id['id'] }).then(response => {
            urlMetadata(response['url']).then((metadata) => {
                res.send(metadata)
            }).catch(err => console.log(err))
        }).catch(err => res.status(403).json({ success: false, message: err }));
    } else {
        res.send({})
    }
}

async function getTopComment(req, res) {
    // get most voted, or get latest.

    const lookupUser = req.query['uid'] !== 'null' ? ObjectID(req.query['uid']) : null;
    const com = await Comments.aggregate([
        { $match: { articleId: ObjectID(req.query['articleId']) } },
        { $sort: { submittedDate: -1 } },
        { $limit: 1 },
        {
            $lookup: {
                from: "users",
                localField: "_userId",
                foreignField: "_id",
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
                    {
                        "$match": {
                            "$expr": {
                                "$and": [
                                    { "$eq": ["$commentId", "$$commentId"] },
                                    { "$eq": ["$_submitUserId", lookupUser] }
                                ]
                            }
                        }
                    },
                ],
                as: "likes"
            }
        },
        {   // does requested user like this user's comment
            $lookup: {
                from: "likevotes",
                let: { "commentId": "$_id" },
                pipeline: [
                    { "$match": { "$expr": { "$eq": ["$$commentId", "$commentId"] } }, },
                ],
                as: "countlikes"
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
                "likes": { "$arrayElemAt": ["$likes", 0] },
                "countLikes": { "$size": "$countlikes" }
            }
        },
        {
            $group: {
                _id: "$_id",
                user: {
                    $first: "$user",
                },
                reply: { $first: "$reply" },
                likes: {
                    $first: "$likes.response"
                },
                countLikes: { $first: "$countLikes" }
            }
        },
    ]).exec()
        .catch(err => {
            console.log("error", err)
        })

    if (!!com[0]) {
        res.send({ ...com[0], type: 'top' })
    } else {
        Comments.findOne(
            { articleId: ObjectID(req.query['articleId']) },
        ).sort({ submittedDate: -1 })
            .then(result => {
                res.send({ ...result, type: 'latest' })
            })
            .catch(err => console.log(err))

    }
}

function getArticleTally(req, res) {
    const articleId = req.query['articleId']
    Poll.aggregate([
        { $match: { "articleId": ObjectID(articleId) } },
        {
            $group: {
                _id: "$real",
                count: { "$sum": 1 }
            }
        },
        {
            "$group": {
                "_id": null,
                "counts": {
                    "$push": {
                        "k": "$_id",
                        "v": "$count"
                    }
                }
            }
        },
        {
            "$replaceRoot": {
                "newRoot": { "$arrayToObject": "$counts" }
            }
        }
    ])
        .then(result => {
            res.send(result[0])
        }).catch(error => {
            res.status(403).json({ success: false, message: error })
        })
}

function submitVote(req, res) {
    const info = req.body;
    Poll.findOneAndUpdate(
        { articleId: ObjectID(info['articleId']), _submitUserId: ObjectID(req.user_id) },
        {
            $set: {
                articleId: ObjectID(info['articleId']),
                _submitUserId: ObjectID(req.user_id),
                real: info['real'],
                submittedDate: new Date()
            }
        },
        { upsert: true, new: true })
        .then(result => {
            res.status(200).send(result)
        }).catch(error => {
            res.status(403).json({ success: false, message: error })
        })
}

async function getMyVoteId(req, res) {
    const info = req.query['articleId'];
    const result = await Poll.findOne(
        { articleId: ObjectID(info), _submitUserId: ObjectID(req.user_id) }
    ).exec()
        .catch(err => { console.log(err) });
    res.status(200).send(result);
}

function latestArticle(req, res) {
    const page = req.query.page;
    const limit = Number(req.query.limit) || 10;

    Articles.aggregate([
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "articleId",
                as: "comments"
            },
        },{
            $unwind: {
                path: "$comments",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "users",
                let: { userId: "$comments._userId" },
                pipeline: [
                    {
                        $match:
                        {
                            '$expr':
                            {
                                '$eq': ['$_id', '$$userId']
                            }
                        }
                    },
                    {
                        '$project':{
                            '_id': 1,
                            'handle': 1,
                            'displayname':1,
                            'photoUrl': 1
                        }
                    }
                ],
                as: "comments.user"
            },
        },
        {
            $unwind: {
                path: "$comments.user",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                "_id": 1,
                "url": 1,
                "hashtags": 1,
                "real": 1,
                "submittedDate": 1,
                "comments": 1,
            }
        },
        {
            $group: {
                _id: "$_id",
                url: { $first: "$url"},
                hashtags: {$first: "$hashtags"},
                real: {$first: "$real"},
                comments: { $first: "$comments" },
                submittedDate: { $first: "$submittedDate" }
            }
        }
    ])
    .skip(page*limit)
    .limit(limit)
    .sort({submittedDate: -1})
    .then(results => {
        res.send(results)
    })
    .catch(err => {
        res.status(403).json({ success: false, massage: err })
    })
    // Articles.find()
    //     .skip(Number(page * limit))
    //     .limit(limit)
    //     .sort({ submittedDate: -1 })
    //     .then(results => {
    //         console.log(results.length)
    //         res.send(results);
    //     }).catch(err => {
    //         res.status(403).json({ success: false, message: err })
    //     });
}

function getSearch(req, res) {
    const model = req.query.type;
    const searchId = req.query.searchId;
    const limit = req.query.limit || 1;

    modelMap[model].find(
        { searchId }
    ).limit(limit)
        .sort({ submittedDate: -1 })
        .then(results => {
            res.send(results)
        })
        .catch(err => {
            res.status(403).json({ success: false, massage: err })
        })
}

async function allComments(req, res) {
    const articleObj = await Articles.findOne({
        searchId: req.query['searchId']
    }).exec()
        .catch(err => { console.log(err) })
    const page_ = req.query['page'] || 0;
    const limit_ = 20;

    const likedComments = await Comments.aggregate([
        { $match: { articleId: ObjectID(articleObj._id) } },
        { $sort: { submittedDate: -1 } },
        { $skip: page_ * limit_ },
        {
            $lookup: {
                from: "users",
                localField: "_userId",
                foreignField: "_id",
                as: "user"
            },
        },
        {
            $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                "_id": 1,
                "reply": 1,
                "submittedDate": 1,
                "user.handle": 1,
                "user.displayname": 1,
                "user.photoUrl":1
            }
        },
        { $graphLookup: {
            from: "comments",
            startWith: "$_id",
            connectFromField: "_id",
            connectToField: "replyCommentId",
            // maxDepth: "depth",
            as: "response",
          }
        },
        {
            $unwind: {
                path: "$response",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "users",
                let: { userId: "$response._userId" },
                pipeline: [
                    {
                        $match:
                        {
                            '$expr':
                            {
                                '$eq': ['$_id', '$$userId']
                            }
                        }
                    },
                    {
                        '$project':{
                            '_id': 1,
                            'handle': 1,
                            'displayname':1,
                            'photoUrl': 1
                        }
                    }
                ],
                as: "response.user"
            }
        },
        {
            $unwind: {
                path: "$response.user",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $project: {
                "_id": 1,
                "user": 1,
                "reply": 1,
                "submittedDate": 1,
                "response": 1
            }
        },
        {
            $group: {
                _id: "$_id",
                reply: { $first: "$reply" },
                user: { $first: "$user" },
                response: { $push: "$response" },
                submittedDate: { $first: "$submittedDate" }
            }
        }
    ]).exec()
        .catch(err => {
            res.status(403).json({ success: false, massage: err })
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