const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
const bcrypt = require('bcrypt');
const sql_connection = require('./env/prod');
const salt = bcrypt.genSaltSync();


const store = new MongoDBStore({
  uri: sql_connection['url'],
  collection: 'sessions'
});

const sessionStore = session({
    secret: salt,
    store,
    resave: false,
    saveUninitialized: true
  })

module.exports = sessionStore;
