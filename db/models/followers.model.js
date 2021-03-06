const mongoose = require('mongoose');

const FollowersSchema = new mongoose.Schema({
    followerUserId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    status: {
        type: Boolean
    },
    _userId: {
        type: mongoose.Types.ObjectId,
        required: true
    }

})

const Follower = mongoose.model('Follower', FollowersSchema);

module.exports = { Follower }