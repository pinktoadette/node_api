const { Hashtags } = require('../../db/models/hashtags.model');

async function formatComment(comment) {
    let newComment = '';
    const arrComment = comment.split(" ");
    for (var i = 0; i < arrComment.length; i++) {
        const word = arrComment[i];
        if (word.match(/#[^\s]*/gmi)) {
            const tag = word.split("#")[1];

            await Hashtags.updateOne(
                { hashtag: tag },
                {
                    $set: {
                        hashtag: tag
                    }
                },
                { $upset: true }
            ).exec()
                .catch(err => { console.log(err) })

            newComment += `<a class="hash" href='/search=${tag}'>${word}</a> `;
        } else if (word.match(/@[^\s]*/gmi)) {
            const user = word.split('@')[1];
            newComment += `<a class="hash" href='/p/${user}'>${word}</a> `;
        } else if (word.match(/\^[^\s]*/gmi)) {
            newComment += ''
        } else {
            newComment += `${word} `
        }

    }
    return newComment
}

module.exports = {
    formatComment
}