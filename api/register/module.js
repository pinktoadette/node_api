
const { User } = require('../../db/models');
const twilio = require('twilio');
const { twilioAccountSid, twilioAuthToken} = require('./../../config/constants')
const { v4: uuidv4 } = require('uuid');

function registerUser(req, res) {
    // User sign up
    let body = req.body;
    let newUser = new User({...body, pKey: uuidv4() });

    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        // Session created successfully - refreshToken returned.
        // now we geneate an access auth token for the user
        return newUser.generateAccessAuthToken().then((accessToken) => {
            // access auth token generated successfully, now we return an object containing the auth tokens
            return { accessToken, refreshToken }
        });
    }).then((authTokens) => {
        // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
        res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('X-Access-Token', authTokens.accessToken)
            .send(newUser);
    }).catch((e) => {
        let message = e.message;
        console.log(">>", message)
        if (e.message.includes('duplicate key error collection')) {
            message = "Email already registered."
        }

        res.status(400).send( {success: false, message});
    })
}

async function checkHandle(req, res) {
    const found = await User.findOne(
        {handle: req.query.handle}
    ).exec()
    .catch(err=> console.log(err))
    res.send(found)
}

function loginUser(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            // Session created successfully - refreshToken returned.
            // now we geneate an access auth token for the user

            return user.generateAccessAuthToken().then((accessToken) => {
                // access auth token generated successfully, now we return an object containing the auth tokens
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
            res
                .header('x-refresh-token', authTokens.refreshToken)
                .header('X-Access-Token', authTokens.accessToken)
                .send(user);
        })
    }).catch((e) => {
        res.status(400).send(e);
    });
}


function registerPhone(req, res) {
    var client = new twilio(twilioAccountSid, twilioAuthToken);
    
    const config_params = {
        body: `Register ${req.query.name}. Please submit your pets documents by signing up.`,
        from: '+15005550006',
        to: req.query.phone
    };
    client.messages.create(config_params).then((result) => {
        console.log(result);
        res.send({success:1, message: 'Verification code sent to your phone'});
    }).catch((error) => {
        res.send({ success: 0, message: error});
    });
}

function logoutUser(req, res) {
    if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
        if(err) {
        return next(err);
        } else {
        return res.redirect('/');
        }
    });
    }
}

function userAccessToken(req, res) {
    // we know that the user/caller is authenticated and we have the user_id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('X-Access-Token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
}

module.exports = {
    signup: registerUser,
    login: loginUser,
    logout: logoutUser,
    confirmPhone: registerPhone,
    access: userAccessToken,
    checkHandle
}