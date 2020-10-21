const { authenticate } = require('../../helper/auth');
const comment = require('./module');

module.exports = app => {
    app.post('/comment/article', authenticate, comment.postComment);
    app.get('/comment/response', comment.getResponses);
}