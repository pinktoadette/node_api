const mongoose = require('mongoose');

const HashtagsSchema = new mongoose.Schema({
    hashtag: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    _userId: {
        type: mongoose.Types.ObjectId,
        required: false
    }

})

const Hashtags = mongoose.model('Hashtags', HashtagsSchema);

module.exports = { Hashtags }