const { authenticate } = require('../../helper/auth');
const user = require('./module');

module.exports = app => {
    app.patch('/account/update', authenticate, user.updateProfile);
    app.post('/account/view', user.getUserProfileById); //by id

    app.get('/account/user-info', authenticate, user.getUserInfo); // bytoken
    app.post('/account/follow', authenticate, user.followItem);
    app.post('/account/is_following', authenticate, user.isFollowItem);
    app.get('/account/following', user.following);
    app.get('/account/followers', user.followers);

    app.get('/account/posted', user.viewProfilePost);
    app.get('/account/handle_checks', user.checkHandle);

    app.get('/profile/stats', user.getHandleStats);

    app.get('/mentions', authenticate, user.getMentionList);
    app.post('/social/likes', authenticate, user.likeItem);
    app.get('/social/likes', authenticate, user.getLikeItem);
}