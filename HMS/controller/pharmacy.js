const Pharmacy = require("../src/models/pharmacyModel");
const { fetchAdminDetails } = require("../utils/helper");

module.exports.renderPharmacyForm = async (req, res) => {
  const userType = req.session.userType;
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("add_pharma", { currUser, userType });
};

module.exports.createNewPharmacy = async (req, res) => {
  const newPharmacy = new Pharmacy(req.body);
  try {
    await newPharmacy.save();
    res.status(201).redirect(`/${req.user.role}/pharmacy/manage`);
  } catch (error) {
    res.status(400).redirect(`/${req.user.role}/pharmacy/add`);
  }
};

module.exports.renderManagePharmacyTable = async (req, res) => {
  const userType = req.session.userType;
  const pharmacies = await Pharmacy.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("manage_pharma", { currUser, pharmacies, userType });
};

module.exports.renderPharmacyUpdateForm = async (req, res) => {
  const userType = req.session.userType;
  let pharma = await Pharmacy.findById(req.params.id);
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("update_pharma", { currUser, pharma, userType });
};

module.exports.updatePharmacy = async (req, res) => {
  try {
    const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        quantity: req.body.quant,
        category: req.body.categ,
        vendor: req.body.vendor,
        barcode_number: req.body.bc,
        description: req.body.description,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPharmacy) {
      return res.status(404).send("Pharmacy not found");
    }

    res.redirect(`/${req.user.role}/pharmacy/manage`);
  } catch (error) {
    res.status(500).redirect(`/${req.user.role}/pharmacy/manage`);
  }
};

module.exports.deletePharmacy = async (req, res) => {
  try {
    const deletedPharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
    if (!deletedPharmacy) {
      return res.status(404).send("Pharmacy not found");
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
