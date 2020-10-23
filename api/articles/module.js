
const { Articles } = require('../../db/models');
const { Comments } = require('../../db/models');
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

}

function getArticlePoll(req, res) {
    Poll.find({articleId: req.query['id']}).then(result=>{
        console.log("result")
    })
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
    getArticleId
}