const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { fetchAdminDetails, fetchDoctorDetails } = require('./helper');


//protected url middleware only for logout
function isAdminOrDoctor(req, res, next) {
    const token = req.cookies.token;

    if (!token || token === "") {
        return res.status(401).redirect('/login');
    }

    try {
        const data = jwt.verify(token, config.secret_key);
        if (data.role !== 'admin' && data.role !== 'doctor') {
            return res.status(403).redirect('/login');
        }
        req.user = data;
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).redirect('/login');
    }
}


//verify if the user is authenticated
async function isAuthenticated(req, res, next) {
    const token = req.cookies.token;

    if (!token || token === "") {
        return res.status(401).redirect('/login');
    }

    try {
        const data = jwt.verify(token, config.secret_key);
        if (data.role === 'admin') {
            const admin = await fetchAdminDetails(data.email);
            if (admin) {
                req.user = data; // Set req.user with admin details
                return next();
            } else {
                // Admin not found in database
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Error destroying session:', err);
                    }
                    res.redirect('/login');
                });
            }
        } else if (data.role === 'doctor') {
            const doctor = await fetchDoctorDetails(data.email);
            if (doctor) {
                req.user = data; // Set req.user with doctor details
                res.locals.doctor = doctor;
                return next();
            } else {
                // Doctor not found in database
                req.session.destroy((err) => {
                    if (err) {
                        console.error('Error destroying session:', err);
                    }
                    res.redirect('/login');
                });
            }
        } else {
            // Unknown role
            return res.status(403).redirect('/login');
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).redirect('/login');
    }
};

//protected url middleware to separate admin and doctor
function  isLoggedIn(requiredRole) {
    return (req, res, next) => {
        const token = req.cookies.token;

        if (!token || token === "") {
            return res.status(401).redirect('/login');
        }

        try {
            const data = jwt.verify(token, config.secret_key);
            if (data.role !== requiredRole) {
                return res.status(403).redirect('/login');
            }
            req.user = data;
            next();
        } catch (error) {
            console.log(error);
            return res.status(401).redirect('/login');
        }
    };
}

function dynamicIsLoggedIn(req, res, next) {
    const role = req.user.role;
    if (!role) {
        return res.status(403).redirect('/login'); // Or handle the missing role appropriately
    }
    // Call the isLoggedIn function with the role from req.user
    isLoggedIn(role)(req, res, next);
}

module.exports = { isLoggedIn, isAdminOrDoctor, isAuthenticated, dynamicIsLoggedIn };