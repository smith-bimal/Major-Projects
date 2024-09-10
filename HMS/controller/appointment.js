const Appointment = require("../src/models/appointmentModel");
const Doctor = require("../src/models/docModel");
const { fetchAdminDetails } = require("../utils/helper");

module.exports.renderAppointmentForm = async (req, res) => {
  const userType = req.session.userType;
  const doctors = await Doctor.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  console.log(currUser);
  res.render("create_app", { currUser, doctors, userType });
};

module.exports.createAppointment = async (req, res) => {
  const newAppoint = new Appointment(req.body);

  try {
    await newAppoint.save();
    res.status(201).redirect(`/${req.user.role}/appointment/manage`);
  } catch (error) {
    res.status(400).redirect(`/${req.user.role}/appointment/create`);
  }
};

module.exports.renderManageAppointmentsTable = async (req, res) => {
  const appointments = await Appointment.find({});
  const userType = req.session.userType;
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("manage_app", { currUser, appointments, userType });
};

module.exports.manageAppointment = async (req, res) => {
  const userType = req.session.userType;
  let doctors = await Doctor.find({});
  let app = await Appointment.findById(req.params.id);
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("update_app", { currUser, app, doctors, userType });
};

module.exports.updateAppointment = async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        contact: req.body.contact,
        dob: req.body.dob,
        age: req.body.age,
        gender: req.body.gender,
        address: req.body.address,
        pincode: req.body.pincode,
        app_doc: req.body.app_doc,
        app_date: req.body.app_date,
        reason: req.body.reason,
        notes: req.body.notes,
        status: req.body.app_sts,
      },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).send("Appointment not found");
    }

    res.redirect(`/${req.user.role}/appointment/manage`);
  } catch (error) {
    res.status(500).redirect(`/${req.user.role}/appointment/manage`);
  }
};

module.exports.deleteAppointment = async (req, res) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(
      req.params.id
    );
    if (!deletedAppointment) {
      return res.status(404).send("Appointment not found");
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
