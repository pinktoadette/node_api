
const { Hashtags } = require('../../db/models');

function hashList(req, res) {
    const bodyTag = req.body['hashtag'];

    Hashtags.find({hashtag: { $regex : "^"+bodyTag, $options : "i" } }).limit(10)
       .then(result =>{ 
           res.send(result)
        })
       .catch(err => res.status(404).json({ success: false }));
}


module.exports = {
    list: hashList
}