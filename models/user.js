const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const SALT_FACTOR = 10;

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },
    displayName: String,
    bio: String
});

const noop = function () {};

// function that runs before model is saved
userSchema.pre('save', function (done) {
    let user = this;
    if (!user.isModified('password')) {
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) { return done(err); }
        bcrypt.hash(user.password, salt, noop, function (err, hashedPassword) {
            if (err) { return done(err); }
            user.password = hashedPassword;
            done();
        });
    });
});

// compare real password with password guess
userSchema.methods.checkPassword = function (guess, done) {
    bcrypt.compare(guess, this.password, function (err, isMatch) {
        done(err, isMatch);
    })
};

userSchema.methods.name = function () {
    return this.displayName || this.username;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
