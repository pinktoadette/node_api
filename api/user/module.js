
const { User } = require('../../db/models');
const { LikeVotes } = require('../../db/models/likeVotes.model');
const { ObjectID } = require('mongodb');

function updateProfile(req, res) {
    User.findOneAndUpdate(
        { _id: req.user_id },
        { $set: req.body},
        { new: true}
    ).then((result)=> {
        res.send(result)
    }).catch(error=>{
        res.status(403).json({ success: false, message: error })
    })
}

function viewProfilePost(req, res) {
    const handle = req.query
    User.aggregate([
        { $match : handle },
        {
            $lookup: {
                from: "articles",
                localField: "_id",
                foreignField: "_submitUserId",
                as: "articles"
            }
        },
        {$unwind: "$articles"},
        {
            $group: {
                "_id": "$_id",
                "article" : {$addToSet: "$articles"}
            }
        },
    ])
    .limit(10)
    .sort({submittedDate: -1 })
    .then(results=> {
        res.send(results[0]);
    }).catch((err) => {
        res.status(402).json({ success: false, message: err })
    });
}

function getUserProfile(req, res) {
    User.findOne({ _id: req.body.id}).then((result)=> {
        res.send(result)
    }).catch(error=>{
        res.status(403).json({ success: false, message: error })
    })
}

function checkHandle(req, res) {
    User.find({handle: req.params.handle}).then((result)=>{
        res.send(result)
    })
}

function getMentionList(req, res) {
    User.find({handle: { $regex : "^"+req.query.handle, $options : "i" } }).limit(10).then(result =>{
        res.send(result)
    })
}

function likeItem(req, res) {
    const find = req.body['articleId'] ? {
        articleId: ObjectID(req.body['articleId'])
    }: {
        commentId: ObjectID(req.body['commendId'])
    }

    LikeVotes.findOne(
        { _submitUserId: ObjectID(req.user_id),  ...find},
    ).then((like) => like ? true : false)
    .then((result)=> {
        if (result) {
            LikeVotes.findOneAndRemove({
                _submitUserId: ObjectID(req.user_id),  ...find
            }).then(result=>{
                res.send(result)
            }).catch(error=>{
                console.log(error)
            })
        } else {
            LikeVotes.updateOne(
                { _submitUserId: ObjectID(req.user_id),  ...find},
            {
                $set: {
                    _submitUserId: ObjectID(req.user_id),  
                    submittedDate: new Date(),
                    ...find
                }
            },
            {$upset: true})
            .then(result => {
                console.log("??")
                res.send(result)
            }).catch(err=>{
                console.log(err)
            })
        }
    }).catch(error=>{
        console.log(error)
        res.status(403).json({ success: false, message: error })
    })
}

function getLikeItem(req, res) {
    const find = !!req.body['articleId'] ? {
        articleId: ObjectID(req.body['articleId'])
    }: {
        commentId: ObjectID(req.body['commendId'])
    }

    LikeVotes.findOne(
        { _submitUserId: req.user_id,  ...find}
    ).then((result)=> {
        res.send(result)
    }).catch(error=>{
        res.status(403).json({ success: false, message: error })
    })
} 

module.exports = {
    updateProfile,
    viewProfilePost,
    getUserProfile,
    checkHandle,
    getMentionList,
    likeItem,
    getLikeItem
}