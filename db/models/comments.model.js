const mongoose = require('mongoose');
const { Articles } = require('./articles.model');

// user's poll to the submitted article
const CommentsSchema = new mongoose.Schema({
    articleId: {
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
    replyCommentId: {
        type: mongoose.Types.ObjectId, 
        ref: 'Comments'
    },
    _userId: {
        type: mongoose.Types.ObjectId,
        required: true,
    }
})

const Comments = mongoose.model('Comments', CommentsSchema);

module.exports = { Comments }