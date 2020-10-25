
const { Articles, Comments, LikeVotes } = require('../../db/models');
const { ObjectID } = require('mongodb');

const urlMetadata = require('url-metadata')
const _ = require('lodash');
const commentsModel = require('../../db/models/comments.model');
const { pickMe } = require('../../config/constants');
const { Poll } = require('../../db/models/poll.model');

function submitNewArticle(req, res) {
    const bodyTag = req.body;
    Articles.updateOne(
        { url: bodyTag['url'] },
        {
            $set: {
                ...bodyTag,
                _submitUserId: req.user_id,
                submittedDate: new Date()
            }
        },
        { upsert: true }
    ).then(async (result) => {
        if (result['ok']) {
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

            await Comments.updateOne(
                {articleId: ObjectID(result['upserted'][0]['_id']), _userId: ObjectID(req.user_id)},
                {
                    $set: {
                        reply: bodyTag['comment'],
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

            res.send(result);
        }
        res.send({});
    })//.catch(err => res.status(403).json({ success: false, message: err }));
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
    const likes = await LikeVotes.aggregate([
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
        .catch(err => {
            console.log(err)
        })
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
    Articles.find()
    .limit(10)
    .sort({submittedDate: -1})
    .then(results=> {
        res.send(results);
    }).catch(err => res.status(403).json({ success: false, message: err }));

}

module.exports = {
    submitNewArticle,
    latestArticle,
    getArticleId,
    getTopComment,
    submitVote,
    getMyVoteId,
    getArticleTally
}