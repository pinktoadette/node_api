const mongoose = require('mongoose');

const FollowingSchema = new mongoose.Schema({
    followUserId: {
        type: mongoose.Types.ObjectId,
    },
    followArticleId: {
        type: mongoose.Types.ObjectId
    },
    followCommentId: {
        type: mongoose.Types.ObjectId
    },
    _userId: {
        type: mongoose.Types.ObjectId,
        required: true
    }

})

const Following = mongoose.model('Following', FollowingSchema);

module.exports = { Following }