const { List } = require('./list.model');
const { Task } = require('./task.model');
const { User } = require('./user.model');
const { Hashtags } = require('./hashtags.model');
const { Articles } = require('./articles.model');
const { UserPoll } = require('./userPoll.model');
const { UserPollComments } = require('./userPollComments.model');


module.exports = {
    List,
    Task,
    User,
    Hashtags,
    Articles,
    UserPoll,
    UserPollComments
}