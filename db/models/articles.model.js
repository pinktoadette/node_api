const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    real: {
        type: String,
        required: true
    },
    hashtags: [{
        type: String
    }],
    submittedDate: {
        type: Date,
        required: true
    },
    _submitUserId: {
        type: mongoose.Types.ObjectId,
        required: true
    }

})

const Articles = mongoose.model('Articles', ArticleSchema);

module.exports = { Articles }