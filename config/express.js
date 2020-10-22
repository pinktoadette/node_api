const express = require('express');
const [corsHandler, router] = require('./routes');
const  path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const db = require('../db/mongoose');

module.exports = () => {    
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  
  // Connect to Mongo
  db;

  app.use(express.static(path.join(__dirname, './')));
  app.use(corsHandler);      
  app.use('/api/v1', router);
  return app;
};