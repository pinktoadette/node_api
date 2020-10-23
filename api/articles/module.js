
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
    ).then((result) => {
        res.send(result);
    }).catch(err => res.status(403).json({ success: false, message: err }));
}

function getArticleId(req, res) {
    let id = req.query;
    // this gets specific article Id for each box article

    // 1. missing seo tags for some websites
    // 2. get youtube seo tags
    // 3. vimeo, pinterest, Periscope,
    // 4. blacklist: ['tiktok','twitter'    ]

    Articles.findOne({_id: id['id']}).then(response => {
        urlMetadata(response['url']).then((metadata) => {
            res.send(metadata)
        }).catch(err => res.status(403).json({ success: false, message: err }));
    })
}

function getPopularComment(req, res) {
    LikeVotes.aggregate([
        { $group: {_id: req.query['articleId'], total: {$sum: 1} }},
        { $sort: { "total": -1 } },
        { $limit: 1 },
    ]).then(result=> {
        // console.log(result)
        res.status(200).send('blah');
    })
}

function getArticleTally(req, res) {
    const articleId = req.query['articleId']
    Poll.aggregate([
        {$match: {"articleId":{$eq : ObjectID(articleId)}}},
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
    ]).then(result =>{
        res.send(result[0])
    }).catch(error =>{
        res.status(403).json({ success: false, message: error })
    })
}

function submitVote(req, res) {
    const info = req.body;
    console.log(info)
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
        console.log(error)
        res.status(403).json({ success: false, message: error })
    })
}

async function getMyVoteId(req, res) {
    const info = req.query['articleId'];
    const result = await Poll.findOne(
        {articleId: ObjectID(info), _submitUserId: ObjectID(req.user_id)}
    ).exec();
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
    getTopComment: getPopularComment,
    submitVote,
    getMyVoteId,
    getArticleTally
}