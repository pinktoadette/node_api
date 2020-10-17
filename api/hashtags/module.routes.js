const hashtags = require('./module');

module.exports = app => {
    app.get('/hashtags', hashtags.list);
}