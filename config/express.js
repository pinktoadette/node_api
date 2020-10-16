const express = require('express');
const [corsHandler, router] = require('./routes');
const  path = require('path');
const sessionStore  = require('./session');
const cookieParser = require('cookie-parser');

module.exports = () => {    
  const app = express();

  app.use(cookieParser());
  app.use(sessionStore);

  app.use(express.static(path.join(__dirname, './')));
  app.use(corsHandler);      
  app.use('/api/v1', router);
  return app;
};