const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    firstName: {
        type: String, 
        trim: true
    },
    lastName:{
        type: String,
        trim: true,
    },
    username: {
        type: String,
        trim: true
    },
    _userId: {
        type: mongoose.Types.ObjectId,
        required: true
    }

})

const Account = mongoose.model('Account', AccountSchema);

module.exports = { Account }