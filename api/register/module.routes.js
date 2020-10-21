const user = require('./module');

module.exports = app => {
     
    app.post('/register', user.signup);
    app.post('/login', user.login);
    app.post('/logout', user.logout)
    app.get('/users/access-token', user.access)
}