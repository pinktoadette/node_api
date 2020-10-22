const { authenticate } = require('../../helper/auth');
const user = require('./module');

module.exports = app => {
    app.patch('/account/update', authenticate, user.updateProfile);
    app.post('/account/view', user.getUserProfile);
    app.get('/account', user.viewProfile);
    app.get('account/handle_checks', user.checkHandle)
}