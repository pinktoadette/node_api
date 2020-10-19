const jwt = require('jsonwebtoken');
const { User } = require('../db/models');

function authenticate(req, res, next) {
    let token = req.header('X-Access-Token');
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            res.status(401).json({ success: false, message: 'Not Logged In' });
        } else {
            req.user_id = decoded._id;
            next();
        }
    });
  }

  module.exports = {
    authenticate
  }