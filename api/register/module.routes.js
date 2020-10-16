const register = require('./module');

module.exports = app => {
     
    app.post('/register', register.user);
    app.get('/register/phone', register.phone);
    
}