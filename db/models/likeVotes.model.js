const mongoose = require('mongoose');

const LikeVotesSchema = new mongoose.Schema({
    articleId: {
        type: mongoose.Types.ObjectId
    },
    commentId: {
        type: mongoose.Types.ObjectId,
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

const LikeVotes = mongoose.model('LikeVotes', LikeVotesSchema);

module.exports = { LikeVotes }