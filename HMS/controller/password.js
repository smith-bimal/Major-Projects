const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { sendResetPasswordMail } = require('../utils/helper');

const Doctor = require('../src/models/docModel');
const Admin = require('../src/models/adminModel');
const { sendMail } = require('../utils/sendMail');

module.exports.renderForgotPasswordPage = (req, res) => {
    res.render('forgot_pwd');
}

module.exports.sendResetLink = async (req, res) => {
    const email = req.body.email;
    const JWT_TOKEN = process.env.SECRET;

    try {
        const doc = await Doctor.findOne({ email: email });
        const admin = await Admin.findOne({ email: email });

        if (!doc && !admin) {
            res.status(404).render('failed_forgot_pwd');
        } else {
            if (doc) {
                const secret = JWT_TOKEN + doc.password;
                const token = jwt.sign({ email: doc.email, id: doc._id }, secret, { expiresIn: '10m' });
                const link = `http://localhost:5000/password/reset/${doc._id}/${token}`;
                console.log(link);
                sendMail(doc.email, link);
                res.status(200).render('reset_link');
              } else if (admin) {
                const secret = JWT_TOKEN + admin.password;
                const token = jwt.sign({ email: admin.email, id: admin._id }, secret, { expiresIn: '10m' });
                const link = `http://localhost:5000/password/reset/${admin._id}/${token}`;
                console.log(link);
                sendMail(admin.email, link);
                res.status(200).render('reset_link');
            }
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports.renderNewPasswordPageWithValidation = async (req, res) => {
    const JWT_TOKEN = process.env.SECRET;
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
}

module.exports.changeNewPassword = async (req, res) => {
    const { new_pwd, cnf_pwd } = req.body;
    const JWT_TOKEN = process.env.SECRET;
    const { id, token } = req.params;
    async (req, res) => {
      const JWT_TOKEN = process.env.SECRET;
      const { id, token } = req.params;

      try {
        const doc = await Doctor.findOne({ _id: id });
        const admin = await Admin.findOne({ _id: id });

        if (doc) {
          const secret = JWT_TOKEN + doc.password;
          console.log("Doctor details found");
          try {
            jwt.verify(token, secret);
            res.status(200).render("reset_pwd");
          } catch (err) {
            res.status(400).send("Invalid or expired token.");
          }
        } else if (admin) {
          const secret = JWT_TOKEN + admin.password;
          console.log("Admin details found");
          try {
            jwt.verify(token, secret);
            res.status(200).render("reset_pwd");
          } catch (err) {
            res.status(400).send("Invalid or expired token.");
          }
        } else {
          res.status(404).send("User not found.");
        }
      } catch (err) {
        res.status(500).send("Something went wrong.");
      }
    };
    if (new_pwd !== cnf_pwd) {
      return res
        .status(400)
        .render("reset_pwd_with_err", { error: "Passwords do not match." });
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

          res.status(200).render("reset-pwd-success");
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

          res.status(200).render("reset-pwd-success");
        } catch (err) {
          res.status(400).send("Invalid or expired token.");
        }
      } else {
        res.status(404).send("User not found.");
      }
    } catch (err) {
      res.status(500).send("Something went wrong.");
    }
  }