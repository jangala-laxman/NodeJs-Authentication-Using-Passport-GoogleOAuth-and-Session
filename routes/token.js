
const express = require('express');
const router = express.Router();
const connection = require('../database.js');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const randtoken = require('rand-token');
//send email
function sendEmail(email, token) {
    const email = email;
    const token = token;
    const mail = nodemailer.createTransport({
    service: 'gmail',
        auth: {
        user: '', // Your email id
        pass: '' // Your password
        }
    });

    const mailOptions = {
    from: 'tutsmake@gmail.com',
    to: email,
    subject: 'Reset Password Link - Tutsmake.com',
    html: '<p>You requested for reset password, kindly use this <a href="http://localhost:4000/reset-password?token=' + token + '">link</a> to reset your password</p>'
    };

    mail.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(1)
        } else {
            console.log(0)
        }
    });
}


/* home page */
router.get('/', function(req, res, next) {
res.render('index', {
title: 'Forget Password Page'
});
});
/* send reset password link in email */
router.post('/reset-password-email', function(req, res, next) {
const email = req.body.email;
//console.log(sendEmail(email, fullUrl));
connection.query('SELECT * FROM users WHERE email ="' + email + '"', function(err, result) {
if (err) throw err;
const type = ''
const msg = ''
console.log(result[0]);
if (result[0].email.length > 0) {
const token = randtoken.generate(20);
const sent = sendEmail(email, token);
if (sent != '0') {
const data = {
token: token
}
connection.query('UPDATE users SET ? WHERE email ="' + email + '"', data, function(err, result) {
if(err) throw err
})
type = 'success';
msg = 'The reset password link has been sent to your email address';
} else {
type = 'error';
msg = 'Something goes to wrong. Please try again';
}
} else {
console.log('2');
type = 'error';
msg = 'The Email is not registered with us';
}
req.flash(type, msg);
res.redirect('/');
});
})
/* reset page */
router.get('/reset-password', function(req, res, next) {
res.render('reset-password', {
title: 'Reset Password Page',
token: req.query.token
});
});
/* update password to database */
router.post('/update-password', function(req, res, next) {
const token = req.body.token;
const password = req.body.password;
connection.query('SELECT * FROM users WHERE token ="' + token + '"', function(err, result) {
if (err) throw err;
let type
let msg
if (result.length > 0) {
const saltRounds = 10;
// const hash = bcrypt.hash(password, saltRounds);
bcrypt.genSalt(saltRounds, function(err, salt) {
bcrypt.hash(password, salt, function(err, hash) {
const data = {
password: hash
}
connection.query('UPDATE users SET ? WHERE email ="' + result[0].email + '"', data, function(err, result) {
if(err) throw err
});
});
});
type = 'success';
msg = 'Your password has been updated successfully';
} else {
console.log('2');
type = 'success';
msg = 'Invalid link; please try again';
}
req.flash(type, msg);
res.redirect('/');
});
})
module.exports = router;