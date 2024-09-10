const { fetchAdminDetails } = require("../utils/helper");
const Employee = require("../src/models/employeeModel");

module.exports.renderAddEmployeeForm = async (req, res) => {
  const userType = req.session.userType;
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("add_employee", { currUser, userType });
};

module.exports.addNewEmployee = async (req, res) => {
  const newEmployee = new Employee({
    ...req.body,
    avatar: req.file.filename,
  });
  try {
    await newEmployee.save();
    res.status(201).redirect(`/${req.user.role}/employee/q`);
  } catch (error) {
    res.status(400).redirect(`/${req.user.role}/employee/q`);
  }
};

module.exports.renderAllEmployeeListTable = async (req, res) => {
  const userType = req.session.userType;
  const employees = await Employee.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("view_employee", { currUser, employees, userType });
};

module.exports.renderEmployeeDetails = async (req, res) => {
  const userType = req.session.userType;
  const currUser = await fetchAdminDetails(req.user.email);
  const employee = await Employee.findById(req.params.id);
  res.render("employee_profile", { currUser, employee, userType });
};

module.exports.renderEmployeeManageTable = async (req, res) => {
  const userType = req.session.userType;
  const employees = await Employee.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("manage_employee", { currUser, employees, userType });
};

module.exports.renderEmployeeUpdateForm = async (req, res) => {
  const userType = req.session.userType;
  const employee = await Employee.findById(req.params.id);
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("update_employee", { currUser, employee, userType });
};

module.exports.updateEmployeeDetails = async (req, res) => {
  let updateData = {};

  if (!req.file) {
    updateData = {
      full_name: req.body.name,
      email: req.body.email,
      contact_number: req.body.contact,
      date_of_birth: req.body.dob,
      gender: req.body.gender,
      age: req.body.age,
      address: req.body.address,
      pincode: req.body.pincode,
      employee_id: req.body.id,
      department: req.body.dept,
      position: req.body.position,
      qualification: req.body.qual,
      experience: req.body.exp,
      notes: req.body.notes,
    };
  } else {
    updateData = {
      full_name: req.body.name,
      email: req.body.email,
      contact_number: req.body.contact,
      date_of_birth: req.body.dob,
      gender: req.body.gender,
      age: req.body.age,
      address: req.body.address,
      pincode: req.body.pincode,
      employee_id: req.body.id,
      department: req.body.dept,
      position: req.body.position,
      qualification: req.body.qual,
      experience: req.body.exp,
      notes: req.body.notes,
      avatar: req.file.filename,
    };
  }

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).send("Employee details not found");
    }

    res.redirect(`/${req.user.role}/employee/manage`);
  } catch (error) {
    res.status(500).send("Error updating Employee details");
  }
};

module.exports.deleteEmployeeDetails = async (req, res) => {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) {
      return res.status(404).send("Employee not found");
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
