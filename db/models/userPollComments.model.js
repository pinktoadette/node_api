const mongoose = require('mongoose');
const { Articles } = require('./articles.model');

// user's poll to the submitted article
const UserPollCommentsSchema = new mongoose.Schema({
    article: {
        type: mongoose.Types.ObjectId,
        required: true,
        minlength: 1,
        trim: true
    },
    comment: {
        type: String,
        required: true
    },
    submittedDate: {
        type: Date,
        required: true
    },
    _userId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
})

const UserPollComments = mongoose.model('UserPollComments', UserPollCommentsSchema);

module.exports = { UserPollComments }