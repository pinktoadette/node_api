// This file will handle connection logic to the MongoDB database

const mongoose = require('mongoose');
// mongodb+srv://dbCrowdPolls:U2wjnvlArHFt4EH9@clustera.rj8vf.mongodb.net/test'
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/dbPolls', { useNewUrlParser: true }).then(() => {
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