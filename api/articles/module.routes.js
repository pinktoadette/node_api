const { authenticate } = require('../../helper/auth');
const articles = require('./module');

module.exports = app => {
    app.post('/opinions/submit', authenticate, articles.submitNewArticle);
    app.get('/articles/latest', articles.latestArticle);
    app.get('/articles/single', articles.getArticleId);
    app.get('/articles/top_comment', articles.getTopComment);
    app.post('/articles/my_vote', authenticate, articles.submitVote);
    app.get('/articles/my_vote', authenticate, articles.getMyVoteId);
    app.get('/articles/poll_count', articles.getArticleTally);
    app.get('/articles/comments', articles.allComments)

    // generic: applies to all search
    // <type>?=<id>
    app.get('/search', articles.getSearch)
}