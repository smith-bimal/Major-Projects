const bcrypt = require("bcrypt");

const { fetchDoctorDetails } = require("../utils/helper");
const Doctor = require("../src/models/docModel");

module.exports.renderProfilePage = async (req, res) => {
  const userType = req.session.userType;
  const userEmail = req.user.email;
  const currUser = await fetchDoctorDetails(userEmail);
  res.render("doc_profile_acc", { currUser, userType });
};

module.exports.updateProfile = async (req, res) => {
  let updateData = {
    bio: req.body.bio,
    contact_number: req.body.contact,
    address: req.body.address,
    pincode: req.body.pincode,
    username: req.body.username,
  };

  try {
    if (req.body.pwd && req.body.pwd.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.pwd, salt);
      updateData.password = hashedPassword;
    }

    if (req.file) {
      updateData.avatar = req.file.filename;
    }

    const updatedDoctor = await Doctor.findOneAndUpdate(
      { email: req.user.email },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).send("Doctor not found");
    }

    res.redirect(`/${req.user.role}/profile`);
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).send("Internal Server Error");
  }
};
