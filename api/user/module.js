
const { User, Follower, Following, Comments, Articles, LikeVote } = require('../../db/models');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

function updateProfile(req, res) {
    let u = _.pickBy(req.body, _.identity);

    User.findByIdAndUpdate(req.user_id,
        {
            $set: u,
        }).then(result => {
            res.send(result)
        }).catch(err => {
            res.status(402).json({ success: false, message: err })
        })
}

function viewProfilePost(req, res) {
    const handle = req.query
    User.aggregate([
        { $match: handle },
        {
            $lookup: {
                from: "articles",
                localField: "_id",
                foreignField: "_submitUserId",
                as: "articles"
            }
        },
        {
            $unwind: {
                path: "$articles",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $group: {
                "_id": "$_id",
                "article": { $addToSet: "$articles" },
                "photoUrl": { $first: "$photoUrl" }
            }
        }
    ])
        .limit(10)
        .sort({ submittedDate: -1 })
        .then(results => {
            res.send(results[0]);
        }).catch((err) => {
            res.status(403).json({ success: false, message: err })
        });
}

function getUserProfile(req, res) {
    User.findOne({ _id: req.body.id }).then((result) => {
        res.send(result)
    }).catch(error => {
        res.status(403).json({ success: false, message: error })
    })
}

function checkHandle(req, res) {
    User.find({ handle: req.params.handle }).then((result) => {
        res.send(result)
    })
}

function getMentionList(req, res) {
    User.find({ handle: { $regex: "^" + req.query.handle, $options: "i" } }).limit(10).then(result => {
        res.send(result)
    })
}

function likeItem(req, res) {
    const find = req.body['articleId'] ? {
        articleId: ObjectID(req.body['articleId'])
    } : {
            commentId: ObjectID(req.body['commentId'])
        }

    LikeVote.update(
        { _submitUserId: ObjectID(req.user_id), ...find },
        {
            $set: {
                _submitUserId: ObjectID(req.user_id),
                submittedDate: new Date(),
                response: req.body['response'],
                ...find
            }
        },
        { upsert: true })
        .then(result => {
            res.send(result)
        }).catch(err => {
            console.log(err)
        })
}

function getLikeItem(req, res) {

    const find = req.query['articleId'] ? {
        articleId: ObjectID(req.query['articleId'])
    } : {
            commentId: ObjectID(req.query['commentId'])
        }

    LikeVote.findOne(
        { _submitUserId: req.user_id, ...find }
    ).then((result) => {
        res.send(result)
    }).catch(error => {
        res.status(403).json({ success: false, message: error })
    })
}

async function getHandleStats(req, res) {
    const user = await User.findOne({handle: req.query['handle']})

    const comments = await Comments.countDocuments({_userId: user._id}).exec()
    const posts = await Articles.countDocuments({_submitUserId: user._id}).exec()

    // follower: who is following user
    const followers = await Follower.countDocuments({ followerUserId: user._id}).exec();
    // following: who user is following
    const following = await Following.countDocuments({ _userId: user._id}).exec()

    res.send({
        comments,
        posts,
        followers,
        following
    })
}

module.exports = {
    updateProfile,
    viewProfilePost,
    getUserProfile,
    checkHandle,
    getMentionList,
    likeItem,
    getLikeItem,
    getHandleStats
}