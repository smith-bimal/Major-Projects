const Doctor = require("../src/models/docModel");

module.exports.logOutUser = async (req, res) => {
    try {
        if (req.user.role === 'doctor') {
            await Doctor.findOneAndUpdate({ email: req.user.email }, { status: 'Offline' });
        }

        // Clear the "token" cookie
        res.clearCookie('token');

        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Unable to log out');
            }
            setTimeout(() => {
                res.redirect("/login");
            }, 1500);
        });
    } catch (err) {
        console.error('Error during logout:', err);
        res.status(500).send('Unable to log out');
    }
}