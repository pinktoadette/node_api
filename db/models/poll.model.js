const mongoose = require('mongoose');

// user's poll to the submitted article
const PollSchema = new mongoose.Schema({
    articleId: {
        type: mongoose.Types.ObjectId,
        required: true,
        trim: true
    },
    real: {
        type: String || null,
        required: true
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

const Poll = mongoose.model('Poll', PollSchema);

module.exports = { Poll }