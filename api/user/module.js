
const { User } = require('../../db/models');
const urlMetadata = require('url-metadata');
const {pickMe } = require('../../config/constants');
const _ = require('lodash');

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

module.exports = {
    updateProfile,
    viewProfilePost,
    getUserProfile,
    checkHandle
}