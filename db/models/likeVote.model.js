const mongoose = require('mongoose');

const LikeVoteSchema = new mongoose.Schema({
    articleId: {
        type: mongoose.Types.ObjectId
    },
    commentId: {
        type: mongoose.Types.ObjectId,
    },
    response: {
        type: String
    },
    submittedDate: {
        type: Date,
        required: true
    },
    _submitUserId: {
        type: mongoose.Types.ObjectId,
        required: true
    }

})

const LikeVote = mongoose.model('LikeVote', LikeVoteSchema);

module.exports = { LikeVote }