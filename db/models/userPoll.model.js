const mongoose = require('mongoose');
const { Articles } = require('./articles.model');

// user's poll to the submitted article
const UserPollSchema = new mongoose.Schema({
    article: {
        type: mongoose.Types.ObjectId,
        required: true,
        minlength: 1,
        trim: true
    },
    pkey: { type: String, unique: true },
    real: {
        type: Boolean,
        required: true
    },
    submittedDate: {
        type: Date,
        required: true
    },
    _votedUserId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
})

const UserPoll = mongoose.model('UserPoll', UserPollSchema);

module.exports = { UserPoll }