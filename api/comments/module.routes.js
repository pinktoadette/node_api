const { authenticate } = require('../../helper/auth');
const comment = require('./module');

module.exports = app => {
    app.post('/comment/article', authenticate, comment.postComment);
    app.post('/comment/reply', authenticate, comment.replyComment);
    app.get('/comment/response', comment.getResponses);
    app.get('/comment/user_comments', authenticate, comment.getUserResponse);
}