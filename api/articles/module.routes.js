const { authenticate } = require('../../helper/auth');
const articles = require('./module');

module.exports = app => {
    app.post('/articles/submit_url', authenticate, articles.submitNewArticle);
    app.get('/articles/latest', articles.latestArticle);
}