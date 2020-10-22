// This file will handle connection logic to the MongoDB database

const mongoose = require('mongoose');
const NODE_ENV = require('../config/env/prod');

mongoose.Promise = global.Promise;
mongoose.connect(NODE_ENV.dbUrl, { useNewUrlParser: true }).then(() => {
    console.log("Connected to MongoDB successfully :)");
}).catch((e) => {
    console.log("Error while attempting to connect to MongoDB");
    console.log(e);
});

// To prevent deprectation warnings (from MongoDB native driver)
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);


module.exports = {
    mongoose
};