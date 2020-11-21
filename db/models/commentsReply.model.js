const mongoose = require('mongoose');
const { Articles } = require('./articles.model');

// user's poll to the submitted article
const CommentsReplySchema = new mongoose.Schema({
    commentId: {
        type: mongoose.Types.ObjectId,
        required: true,
        minlength: 1,
        trim: true
    },
    reply: {
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

const CommentsReply = mongoose.model('CommentsReply', CommentsReplySchema);

module.exports = { CommentsReply }