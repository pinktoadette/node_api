const { ObjectID } = require('mongodb');
const { Comments } = require('../../db/models');
const { Poll } = require('../../db/models/poll.model');

const _ = require('lodash');
const commentsModel = require('../../db/models/comments.model');

function postComment(req, res) {
    const bodyTag = req.body;

    let status,
        error=[];
    if (bodyTag['real']) {
        Poll.findOneAndUpdate(
            {articleId: bodyTag['articleId'], _submitUserId: req.user_id},
            {$set: {
                articleId: bodyTag['articleId'], 
                _submitUserId: req.user_id, 
                submittedDate: new Date(),
                real: bodyTag['real']
            }},
            {upsert: true}
        ).then((resp)=>{
            status = resp.ok === 1;
        }).catch(err=>{
            error.push(err);
        })
    }

    if(bodyTag['reply']){
        // if comment is same and article is same, dont want duplicate
        const comment = {
            articleId: ObjectID(bodyTag['articleId']),
            reply: bodyTag['reply']
        }

        Comments.updateOne(
            comment,
            { $set: {...comment, 
                _submitUserId: req.user_id,
                submittedDate: new Date()
            } },
            { upsert: true }
        ).then((result)=> {
            const pollOk = bodyTag['real'] && status;
            status = pollOk && result.ok === 1 
        }).catch(err=>{
            error.push(err)
        })
    }
    if (!error.length) {
        res.send({ success: true, message: 'saved' });
    } else {
        res.status(403).json({ success: false, message: error })
    }
}

function getResponses(req, res) {
    //
    Comments.find().limit(10).sort({submittedDate:-1}).then(results=> {
        res.send(results);
    }).catch((err) => {
            console.log(err.message);
    });
}

module.exports = {
    postComment,
    getResponses
}