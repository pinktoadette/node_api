const { ObjectID } = require('mongodb');
const { Comments, CommentsReply, User, Poll } = require('../../db/models');
const { formatComment } = require('../helper')

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

async function replyComment(req, res) {
    const bodyTag = req.body;
    const comment = await formatComment(bodyTag['comment']);

    Comments.updateOne(
        { 
            replyCommentId: ObjectID(bodyTag['commentId']), 
            _userId: ObjectID(req.user_id),
            reply: comment // prevent duplicate
            },
        {
            $set: {
                reply: comment,
                submittedDate: new Date(),
                _userId: ObjectID(req.user_id),
                replyCommentId:  ObjectID(bodyTag['commentId'])
            }
        },
        { upsert: true }
    ).then(results =>{
        res.send(results)
    })
    .catch(err => {
        console.log(err)
    })
    
}

function getResponses(res) {
    //
    Comments.find().limit(10).sort({submittedDate:-1}).then(results=> {
        res.send(results);
    }).catch((err) => {
            console.log(err.message);
    });
}

async function getUserResponse(req, res) {
    const page_ = req.query['page'] || 0;
    const limit_ = 20;
    const user = await User.findOne({handle: req.query['handle']}).exec()
    const curUser = req.user_id || null;
    
    Comments.aggregate([
        {$match: {_userId: user._id}},
        {$sort: {submittedDate: -1}},
        {$skip: page_*limit_},
        {$limit: limit_},
        {
            $lookup: {
                from: "users",
                localField: "_userId",
                foreignField: "_id",
                as: "user"
            },
        },
        {
            $lookup: {
                from: "likevotes",
                let: { "commentId": "$_id" },
                pipeline: [
                    {
                        "$match": {
                            "$and": [
                                { "$expr": { "$eq": ["$$commentId", "$commentId"] } },
                                { "_submitUserId": curUser}
                            ]
                        }
                    },
                ],
                as: "likes"
            }
        },
        {   
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
                user: {$first: "$user"},
                reply: { $first: "$reply" },
                likes: {
                    $first: "$likes.response"
                },
                countLikes: { $first: "$countLikes" }
            }
        },
    ])
    .then(results =>{
        res.send({results, user})
    })
    .catch(err=>{
        console.log(err)
    })

    
}

module.exports = {
    postComment,
    getResponses,
    getUserResponse,
    replyComment
}