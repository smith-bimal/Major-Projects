require("dotenv").config();
const express = require("express");
const app = express();

const path = require("path");
const fs = require("fs");
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require("express-session");
const MongoStore = require('connect-mongo');

//database files acquiring
require("./src/db/conn");

const config = require('./config/config');

const loginRouter = require("./routes/loginRoutes");
const adminRouter = require("./routes/admin");
const doctorRouter = require("./routes/doctor");
const passwordRouter = require("./routes/passwordRoutes");
const logoutRouter = require("./routes/logoutRoutes");

// Middleware setup
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "templates/views"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 60 * 60,
});

store.on("error", (err) => {
    console.log("ERROR ON MONGO SESSION STORE" + err);
})

// Configure express-session middleware
app.use(session({
    store,
    secret: process.env.SECRET, // Use the secret key from your config
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false, // Set to true if using HTTPS
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
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
app.use("/password", passwordRouter)
app.use("/logout", logoutRouter)

// 404 page not found
app.get('*', (req, res) => {
    const userType = req.session.userType;
    res.render("404", { userType });
});

// port listening console log
app.listen(5000, () => {
    console.log("Port is listening on port 5000");
});

