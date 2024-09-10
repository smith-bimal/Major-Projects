const express = require("express");
const session = require("express-session");
const app = express();
const path = require("path");
const fs = require("fs");
const methodOverride = require('method-override');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');

const config = require('./config/config');

const loginRouter = require("./routes/loginRoutes");
const adminRouter = require("./routes/admin");
const doctorRouter = require("./routes/doctor");

//database files acquiring
require("./src/db/conn");
const Admin = require("./src/models/adminModel");
const Doctor = require("./src/models/docModel");
const { isAdminOrDoctor, isAuthenticated } = require("./utils/middlewares");


// Middleware setup
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates/views"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Configure express-session middleware
app.use(session({
    secret: config.secret_key, // Use the secret key from your config
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Middleware to log all requests
app.use((req, res, next) => {
    const logDetails = `${new Date().toISOString()} - ${req.method} ${req.originalUrl} - ${req.ip}\n`;
    fs.appendFile(path.join(__dirname, 'log.txt'), logDetails, (err) => {
        if (err) {
            console.error("Failed to write to log file:", err);
        }
    });
    next();
});

//Middleware to set user type based on URL path
app.use((req, res, next) => {
    if (req.path.startsWith('/admin')) {
        req.session.userType = 'admin';
    } else if (req.path.startsWith('/doctor')) {
        req.session.userType = 'doctor';
    }
    next();
});


app.get("/", (req, res) => {
    res.render("index");
});

app.use("/login", loginRouter)

app.use("/admin", adminRouter)

app.use("/doctor", doctorRouter)

//Logout Route--------------------------------------------------
app.post("/logout", isAdminOrDoctor, isAuthenticated, async (req, res) => {
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
});


// port listening console log
app.listen(5000, () => {
    console.log("Port is listening on port 5000");
});

//Forgot Password page
app.route('/forgot-password').get((req, res) => {
    res.render('forgot_pwd');
}).post(async (req, res) => {
    const email = req.body.email;
    const JWT_TOKEN = config.secret_key;

    try {
        const doc = await Doctor.findOne({ email: email });
        const admin = await Admin.findOne({ email: email });

        if (!doc && !admin) {
            res.status(404).render('failed_forgot_pwd');
        } else {
            if (doc) {
                const secret = JWT_TOKEN + doc.password;
                const token = jwt.sign({ email: doc.email, id: doc._id }, secret, { expiresIn: '10m' });
                const link = `http://localhost:5000/reset-password/${doc._id}/${token}`;
                console.log(link);
                sendResetPasswordMail(doc.email, link)
                res.status(200).render('reset_link');
            } else if (admin) {
                const secret = JWT_TOKEN + admin.password;
                const token = jwt.sign({ email: admin.email, id: admin._id }, secret, { expiresIn: '10m' });
                const link = `http://localhost:5000/reset-password/${admin._id}/${token}`;
                console.log(link);
                sendResetPasswordMail(admin, link)
                res.status(200).render('reset_link');
            }
        }
    } catch (e) {
        console.log(e);
    }
});


//reset password route
app.route('/reset-password/:id/:token')
    .get(async (req, res) => {
        const JWT_TOKEN = config.secret_key;
        const { id, token } = req.params;

        try {
            const doc = await Doctor.findOne({ _id: id });
            const admin = await Admin.findOne({ _id: id });

            if (doc) {
                const secret = JWT_TOKEN + doc.password;
                console.log("Doctor details found");
                try {
                    jwt.verify(token, secret);
                    res.status(200).render('reset_pwd');
                } catch (err) {
                    res.status(400).send("Invalid or expired token.");
                }
            } else if (admin) {
                const secret = JWT_TOKEN + admin.password;
                console.log("Admin details found");
                try {
                    jwt.verify(token, secret);
                    res.status(200).render('reset_pwd');
                } catch (err) {
                    res.status(400).send("Invalid or expired token.");
                }
            } else {
                res.status(404).send("User not found.");
            }
        } catch (err) {
            res.status(500).send("Something went wrong.");
        }
    })
    .post(async (req, res) => {
        const { new_pwd, cnf_pwd } = req.body;
        const JWT_TOKEN = config.secret_key;
        const { id, token } = req.params;

        if (new_pwd !== cnf_pwd) {
            return res.status(400).render('reset_pwd_with_err', { error: "Passwords do not match." });
        }

        try {
            const doc = await Doctor.findOne({ _id: id });
            const admin = await Admin.findOne({ _id: id });

            if (doc) {
                const secret = JWT_TOKEN + doc.password;
                console.log("Doctor details found");
                try {
                    jwt.verify(token, secret);

                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(req.body.new_pwd, salt);

                    doc.password = hashedPassword;
                    await doc.save();

                    res.status(200).render('reset-pwd-success');
                } catch (err) {
                    res.status(400).send("Invalid or expired token.");
                }
            } else if (admin) {
                const secret = JWT_TOKEN + admin.password;
                console.log("Admin details found");
                try {
                    jwt.verify(token, secret);

                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(req.body.new_pwd, salt);

                    admin.password = hashedPassword;
                    await admin.save();

                    res.status(200).render('reset-pwd-success');
                } catch (err) {
                    res.status(400).send("Invalid or expired token.");
                }
            } else {
                res.status(404).send("User not found.");
            }
        } catch (err) {
            res.status(500).send("Something went wrong.");
        }
    });


// 404 page not found
app.get('*', (req, res) => {
    const userType = req.session.userType;
    res.render("404", { userType });
});


//Sending reset password mail function
function sendResetPasswordMail(email, link) {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'info@hmsexample.com',
            pass: 'yourpassword'
        }
    });

    let mailOptions = {
        from: 'info@hmsexample.com',
        to: email,
        subject: 'Reset your HMS login password!!!',
        text: `Click the below mentioned link to reset your HMS login password \n ${link}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}