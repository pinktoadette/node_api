
const { Articles } = require('../../db/models');
const urlMetadata = require('url-metadata')
const _ = require('lodash');
const pickMe = [
    'og:article:published_time',
    'og:article:author',
    'og:article:section',
    'og:article:tag',
    'og:locale',
    'og:title',
    'og:type',
    'og:description',
    'og:determiner',
    'og:site_name',
    'og:image',
    'og:image:secure_url',
    'og:image:type',
    'og:image:width',
    'og:image:height',
    'source',]

function submitNewArticle(req, res) {
    const bodyTag = req.body;

    Articles.find({url: bodyTag['url']}).then(()=> {
        res.status(403).json({ success: false, message: 'Url already exists.' })
    })

    let article = new Articles({...bodyTag, 
        _submitUserId: req.user_id,
        submittedDate: new Date()
    })

    article.save().then(result =>{
        res.send(result)
    }).catch(err => res.status(403).json({ success: false, message: err }));

}

function latestArticle(req, res) {
    Articles.find().limit(10).then(results=> {
        const r = results.reduce((acc, result) => {
            //@todo need safe url
            const n =urlMetadata(result['url']).then((metadata)=>{
                metadata = _.pick(metadata,pickMe)
                return Promise.resolve(metadata);
                },error => {
                    res.status(403).json({ success: false, message: error });
            })
            acc.push(n)
            return acc
        }, [])
        Promise.all(r).then(meta =>{
            res.send(meta)
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