const hashtags = require('./module');

module.exports = app => {
    app.post('/hashtags', hashtags.list);
}