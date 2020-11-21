// This file will handle connection logic to the MongoDB database

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const connect = require(`../config/env/${process.env.NODE_ENV.trim()}`);

mongoose.connect(connect.dbUrl, { useNewUrlParser: true }).then(() => {
    console.log(`Connected to MongoDB successfully - ${connect.dbUrl}`);
}).catch((e) => {
    console.log("Error while attempting to connect to MongoDB");
    console.log(e);
});

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

module.exports = {
    mongoose
};