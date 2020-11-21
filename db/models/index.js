const { List } = require('./list.model');
const { Task } = require('./task.model');
const { User } = require('./user.model');
const { Hashtags } = require('./hashtags.model');
const { Articles } = require('./articles.model');
const { Poll } = require('./poll.model');
const { Comments } = require('./comments.model');
const { LikeVote } = require('./likeVote.model');
const { Follower } = require('./followers.model');
const { Following } = require('./following.model');
const { CommentsReply } = require('./commentsReply.model');

module.exports = {
    List,
    Task,
    User,
    Hashtags,
    Articles,
    Poll,
    Comments,
    LikeVote,
    Following,
    Follower,
    CommentsReply
}