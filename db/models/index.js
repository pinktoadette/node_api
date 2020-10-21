const { List } = require('./list.model');
const { Task } = require('./task.model');
const { User } = require('./user.model');
const { Hashtags } = require('./hashtags.model');
const { Articles } = require('./articles.model');
const { Poll } = require('./poll.model');
const { Comments } = require('./comments.model');
const { LikeVotes } = require('./likeVotes.model');

module.exports = {
    List,
    Task,
    User,
    Hashtags,
    Articles,
    Poll,
    Comments,
    LikeVotes
}