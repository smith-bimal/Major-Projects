const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware');
const userController = require('../controllers/user');

// User Route 
//₋SignUp Page route₋
router.route('/signup')
    // .get(userController.renderSignUpForm)
    //₋POST SignUp route₋
    .post(wrapAsync(userController.signUpUser));


//₋Login Page route₋
router.route('/login')
    //₋POST Login route₋
    .post(
        saveRedirectUrl,
        passport.authenticate("local", {
            failureRedirect: "/login",
            failureFlash: true
        }), userController.loginUser);


//₋LogOut Page route₋
router.get('/logout', userController.logoutUser);

module.exports = router;