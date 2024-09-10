const bcrypt = require("bcrypt");

const { fetchAdminDetails } = require("../utils/helper");

const Doctor = require("../src/models/docModel");

module.exports.renderNewDoctorForm = async (req, res) => {
  const userType = req.session.userType;
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("add_doctor", { currUser, userType });
};

module.exports.createNewDoctor = async (req, res) => {
  const {
    full_name,
    email,
    contact_number,
    dob,
    gender,
    address,
    pincode,
    doc_id,
    specialty,
    qualification,
    experience,
    username,
    password,
    notes,
    avatar,
  } = req.body;

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return res.status(500).send("error generating salt");

    bcrypt.hash(password, salt, async (err, hash) => {
      const newDoctor = new Doctor({
        full_name,
        email,
        contact_number,
        dob,
        gender,
        address,
        pincode,
        doc_id,
        specialty,
        qualification,
        experience,
        username,
        password: hash,
        notes,
        avatar: req.file.filename,
      });

      try {
        await newDoctor.save();
        res.status(201).redirect(`/${req.user.role}/doctor/q`);
      } catch (error) {
        res.status(400).redirect(`/${req.user.role}/doctor/add`);
      }
    });
  });
};

module.exports.renderDoctorListTable = async (req, res) => {
  const userType = req.session.userType;
  const doctors = await Doctor.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("view_doctor", { currUser, doctors, userType });
};

module.exports.renderDoctorDetails = async (req, res) => {
  const userType = req.session.userType;
  let doctor = await Doctor.findById(req.params.id);
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("doctor_profile", { currUser, doctor, userType });
};

module.exports.renderDoctorManageTable = async (req, res) => {
  const userType = req.session.userType;
  const doctors = await Doctor.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("manage_doctor", { currUser, doctors, userType });
};

module.exports.renderDoctorUpdateForm = async (req, res) => {
  try {
    const userType = req.session.userType;
    const doctor = await Doctor.findById(req.params.id);
    const currUser = await fetchAdminDetails(req.user.email);

    if (!doctor) {
      return res.status(404).send("Doctor not found");
    }

    res.render("update_doctor", { currUser, doctor, userType });
  } catch (error) {
    console.error("Error fetching doctor details:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.updateDoctorDetails = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Check if a file is uploaded
    let avatar = req.body.avatar;
    if (req.file) {
      avatar = req.file.filename;
    }

    let updateData = {};

    if (req.body.password == "" || !req.body.password) {
      updateData = {
        full_name: req.body.name,
        email: req.body.email,
        contact_number: req.body.contact,
        dob: req.body.dob,
        gender: req.body.gender,
        address: req.body.address,
        pincode: req.body.pincode,
        doc_id: req.body.id,
        specialty: req.body.spec,
        qualification: req.body.qual,
        experience: req.body.exp,
        username: req.body.username,
        notes: req.body.note,
        avatar: avatar,
      };
    } else if (avatar == "" || !avatar || !req.file) {
      updateData = {
        full_name: req.body.name,
        email: req.body.email,
        contact_number: req.body.contact,
        dob: req.body.dob,
        gender: req.body.gender,
        address: req.body.address,
        pincode: req.body.pincode,
        doc_id: req.body.id,
        specialty: req.body.spec,
        qualification: req.body.qual,
        experience: req.body.exp,
        username: req.body.username,
        password: hashedPassword,
        notes: req.body.note,
      };
    } else {
      updateData = {
        full_name: req.body.name,
        email: req.body.email,
        contact_number: req.body.contact,
        dob: req.body.dob,
        gender: req.body.gender,
        address: req.body.address,
        pincode: req.body.pincode,
        doc_id: req.body.id,
        specialty: req.body.spec,
        qualification: req.body.qual,
        experience: req.body.exp,
        username: req.body.username,
        password: hashedPassword,
        notes: req.body.note,
        avatar: avatar,
      };
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedDoctor) {
      return res.status(404).send("Doctor not found");
    }

    res.redirect(`/${req.user.role}/doctor/manage`);
  } catch (error) {
    console.error("Error updating doctor:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.deleteDoctorDetails = async (req, res) => {
  try {
    const deletedDoctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) {
      return res.status(404).send("Doctor not found");
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
