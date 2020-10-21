
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

function viewProfile(req, res) {
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
        { $group: 
            {"_id": "$_id", 
            "article": {$addToSet: "$articles"}, 
            "handle" : { $first: '$handle' },
        }},
    ])
    .limit(10)
    .sort({submittedDate: -1 })
    .then(results=> {
        const r = results[0]['article'][0].reduce((acc, result) => {
            //@todo need safe url
            const n =urlMetadata(result['url']).then((metadata)=>{
                metadata = _.pick(metadata,pickMe)
                return Promise.resolve({...metadata});
                },error => {
                    res.status(403).json({ success: false, message: error });
            })
            acc.push(n)
            return acc
        }, [])
        return r
    }).then(response=> {
        Promise.all([...response]).then(meta =>{
            res.send({article: meta});
        })
        .catch((err) => {
            console.log(err.message);
        });
    })
    // User.findOne(handle).then((result)=> {
    //     res.send(result)
    // }).catch(error=>{
    //     res.status(403).json({ success: false, message: error })
    // })
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
    viewProfile,
    getUserProfile,
    checkHandle
}