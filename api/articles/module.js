
const { Articles } = require('../../db/models');
const { Comments } = require('../../db/models');

const urlMetadata = require('url-metadata')
const _ = require('lodash');
const commentsModel = require('../../db/models/comments.model');
const {pickMe } = require('../../config/constants');

function submitNewArticle(req, res) {
    const bodyTag = req.body;
    Articles.updateOne(
        {url: bodyTag['url']},
        { $set: {...bodyTag, 
            _submitUserId: req.user_id,
            submittedDate: new Date()
        } },
        { upsert: true }
    ).then((result)=> {
        res.send(result);
    }).catch(err => res.status(403).json({ success: false, message: err }));
}

function latestArticle(req, res) {
    Articles.find()
    // .aggregate([
        // {$lookup:{
        //     from: "comments",
        //     localField: "_id",
        //     foreignField: "articleId",
        //     as: "comments",
        // }},
        // { $unwind: {
        //     path: "$comments",
        //     preserveNullAndEmptyArrays: false
        //   }
        // },
        // { $lookup:
        //     {
        //         from: 'user',
        //         localField: '_id',
        //         foreignField: 'comments._userId',
        //         as: 'comments.user',
        //     }
        // }  
        // define which fields are you want to fetch
        // {
        //     $lookup: {
        //        from: "likeVotes",
        //        localField: "_id",
        //        foreignField: "articleId",
        //        as: "likeVotes"
        //     }   
        // },
        // {$match:{"likeVotes._submitUserId": req.user_id}}
    // ])
    .limit(10)
    .sort({submittedDate: -1})
    .then(results=> {
        const r = results.reduce((acc, result) => {
            //@todo need safe url
            const n =urlMetadata(result['url']).then((metadata)=>{
                metadata = _.pick(metadata,pickMe)
                return Promise.resolve({...result['_doc'], ...metadata});
                },error => {
                    res.status(403).json({ success: false, message: error });
            })
            acc.push(n)
            return acc
        }, [])
        return r
    }).then(response=> {
        Promise.all([...response]).then(meta =>{
            res.send(meta);
        })
        .catch((err) => {
            console.log(err.message);
        });
    })
}

module.exports = {
    submitNewArticle,
    latestArticle
}