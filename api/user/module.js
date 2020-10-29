
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
    const posted = await Articles.countDocuments({_submitUserId: user._id}).exec()

    // follower: who is following user
    const followers = await Follower.countDocuments({ followerUserId: user._id}).exec();
    // following: who user is following
    const following = await Following.countDocuments({ _userId: user._id}).exec()    
    res.send({
        comments,
        posted,
        followers,
        following
    })
}

async function followItem(req, res) {
    const curUser = req.user_id;
    const body = req.body

    const model = await findModel(body['type'], body['lookup'] )
    Following.updateOne(
        {_userId: curUser, ...model},
        {
            $set: {
                status: body['status'],
                _userId: curUser,
                ...model
            },
        },
        { upsert: true}
    ).then(result => {
        res.send({...result, status: body['status']})
    }).catch(err => {
        console.log(err)
    })
}

async function following(req, res){
    const q = req.query
    const fUser = await User.findOne({ handle: q['handle'] }).exec();

    Following.aggregate([
        {$match: {_userId: fUser._id}},
        {
            $lookup: {
                from: "users",
                localField: "followUserId",
                foreignField: "_id",
                as: "user"
            },
        },{
            $project: {
                "_id":1,
                "user._id": 1,
                "user.handle": 1,
                "user.displayname": 1,
                "user.photoUrl": 1,
            }
        },{
            $group: {
                _id: "$_id",
                user: {$first: "$user"}
            }
        }
    ]).then(result => {
        res.send(result)
    }).catch(err => {
        console.log(err)
    })
}
function followers(req, res) {

}

async function isFollowItem(req, res) {
    const curUser = req.user_id;
    const body = req.body

    const model = await findModel(body['type'], body['lookup'] )
    Following.findOne(
        {_userId: curUser, ...model}
    ).then(result => {
        res.send(result['status'])
    }).catch(err => {
        console.log(err)
    })

}

async function findModel(type, id) {
    if (type === 'user') {
        const fUser = await User.findOne({ handle: id }).exec();
        return { followUserId: fUser._id}
    }
}

module.exports = {
    updateProfile,
    viewProfilePost,
    getUserProfile,
    checkHandle,
    getMentionList,
    likeItem,
    getLikeItem,
    getHandleStats,
    followItem,
    isFollowItem,
    following,
    followers
}