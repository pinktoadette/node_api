
const { Hashtags } = require('../../db/models');

function hashList(req, res) {
    const bodyTag = req.body['tag']
    const tag = new Hashtags(bodyTag);

    const query = tag.find({hashtag: new Regex(tag)}).limit(10)

    query.exec((result)=>{
        res.send(result)
    })
}


module.exports = {
    list: hashList
}