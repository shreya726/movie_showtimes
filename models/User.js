//Code borrowed from perryd@bu.edu @perrydBUCS

const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const user = new Schema({
    username    : {
        type    : String,
        unique  : true
    },
    passwordHash: String,
    passwordSalt: String,

    name: {
        type    : String,
        required: true
    },
    twitterID: String,
    twitterAccessToken: String,
    twitterAccessTokenSecret: String,
    twitterAccessTokenHash: String
});
const User = mongoose.model('users', user);
module.exports = User;