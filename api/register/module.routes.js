const register = require('./module');

module.exports = app => {
     
    app.post('/register', register.signup);
    app.post('/login', register.login);
    
}