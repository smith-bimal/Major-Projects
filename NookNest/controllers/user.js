const Listing = require('../models/listing');
const User = require('../models/user');
const checkAge = require('../utils/moment');

module.exports.signUpUser = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        const newUser = new User({ email, username });
        const regUser = await User.register(newUser, password);

        req.login(regUser, (err) => {
            if (err) { return next(err) };

            req.flash('success', 'You are successfully registered and logged in!');
            res.redirect('/listings');
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/listings');
    }
}

module.exports.loginUser = async (req, res) => {
    req.flash('success', 'You are successfully logged in.');
    res.redirect(res.locals.redirectUrl || '/listings');
}

module.exports.logoutUser = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        } else {
            req.flash('success', 'You are logged out successfully!');
            res.redirect('/listings');
        }
    });

}

module.exports.renderUserProfile = async(req,res)=>{
    let currentUser = res.locals.currentUser;
    const userAge = checkAge(currentUser.created_at);
    const listings = await Listing.find({owner: currentUser.id});
    res.render('pages/profile', {listings, userAge});
}