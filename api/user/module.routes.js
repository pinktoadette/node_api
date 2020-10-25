const { authenticate } = require('../../helper/auth');
const user = require('./module');

module.exports = app => {
    app.patch('/account/update', authenticate, user.updateProfile);
    app.post('/account/view', user.getUserProfile);
    app.get('/account/posted', user.viewProfilePost);
    app.get('/account/handle_checks', user.checkHandle);

    app.get('/mentions', authenticate, user.getMentionList);
    app.post('/social/likes', authenticate, user.likeItem);
    app.get('/social/likes', authenticate, user.getLikeItem);
}