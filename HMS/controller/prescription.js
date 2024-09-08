const Patient = require("../src/models/patientModel");
const Prescription = require("../src/models/prescriptionModel");
const { fetchAdminDetails } = require("../utils/helper");

module.exports.renderAddPrescriptionTable = async (req, res) => {
  const userType = req.session.userType;
  const patients = await Patient.find({});
  const prescriptions = await Prescription.find({});

  // Create a set of patient IDs who already have prescriptions
  const patientsWithPrescriptions = new Set(
    prescriptions.map((presc) => presc.patient_id)
  );

  // Filter out patients who do not have prescriptions
  const patientsWithoutPrescriptions = patients.filter(
    (patient) => !patientsWithPrescriptions.has(patient.patient_id)
  );

  const currUser = await fetchAdminDetails(req.user.email);
  res.render("add_presc", {
    patients: patientsWithoutPrescriptions,
    currUser,
    userType,
  });
};

module.exports.renderNewPrescriptionForm = async (req, res) => {
  const userType = req.session.userType;
  const patient = await Patient.findOne({ patient_id: req.params.id });
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("add_new_presc", { currUser, patient, userType });
};

module.exports.createNewPrescription = async (req, res) => {
  const newPrescription = new Prescription(req.body);
  try {
    await newPrescription.save();
    res.status(201).redirect("/admin/prescription/q");
  } catch (error) {
    res.status(400).redirect("/admin/prescription/add");
  }
};

module.exports.renderViewPrescriptionTable = async (req, res) => {
  const userType = req.session.userType;
  const prescriptions = await Prescription.find({});
  const patients = await Patient.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("view_presc", { currUser, patients, prescriptions, userType });
};

module.exports.renderPrescription = async (req, res) => {
    const userType = req.session.userType;
    let patient = await Patient.findOne({ patient_id: req.params.id });
    let presc = await Prescription.findOne({ patient_id: req.params.id });
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("prescription", { currUser, patient, presc, userType });
  }

  module.exports.renderManagePrescriptionTable =  async (req, res) => {
    const userType = req.session.userType;
    let prescriptions = await Prescription.find({});
    let patients = await Patient.find({});
    const currUser = await fetchAdminDetails(req.user.email);
    res.render("manage_presc", { currUser, patients, prescriptions, userType });
  }

  module.exports.renderUpdatePrescriptionForm = async (req, res) => {
    const userType = req.session.userType;
    const currUser = await fetchAdminDetails(req.user.email);
    let presc = await Prescription.findById(req.params.id);
    res.render("update_presc", { currUser, presc, userType });
  }

  module.exports.updatePrescription =  async (req, res) => {
    try {
      const updatedPrescription = await Prescription.findByIdAndUpdate(
        req.params.id,
        {
          name: req.body.name,
          age: req.body.age,
          address: req.body.address,
          type: req.body.type,
          ailment: req.body.ailment,
          notes: req.body.notes,
        },
        { new: true, runValidators: true }
      );

      if (!updatedPrescription) {
        return res.status(404).send("prescription not found");
      }

      res.redirect("/admin/prescription/q");
    } catch (error) {
      res.status(500).send("Error updating prescription");
    }
  }

  module.exports.deletePrescription = async (req, res) => {
    try {
      const deletedPrescription = await Prescription.findByIdAndDelete(
        req.params.id
      );
      if (!deletedPrescription) {
        return res.status(404).send("Prescription not found");
      }
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }