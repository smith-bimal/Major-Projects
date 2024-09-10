const { fetchAdminDetails } = require("../utils/helper");
const Payroll = require("../src/models/payrollModel");
const Employee = require("../src/models/employeeModel");

module.exports.renderAddPayrollTable = async (req, res) => {
  const userType = req.session.userType;
  const employees = await Employee.find({});
  const payrolls = await Payroll.find({});
  const currUser = await fetchAdminDetails(req.user.email);

  // Create a Set of employee IDs that have salaries
  const employeeWithSalaries = new Set(
    payrolls.filter((p) => p.salary !== "").map((p) => p.employee_id)
  );

  // Filter employees that do not have a salary assigned
  const employeesWithoutSalaries = employees.filter(
    (e) => !employeeWithSalaries.has(e.employee_id)
  );

  res.render("add_payroll", {
    currUser,
    payrolls,
    employees: employeesWithoutSalaries,
    userType,
  });
};

module.exports.renderAddPayrollForm = async (req, res) => {
  const userType = req.session.userType;
  const emp = await Employee.findById(req.params.id);
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("add_new_payroll", { currUser, emp, userType });
};

module.exports.addNewPayroll = async (req, res) => {
  const newPayroll = new Payroll(req.body);
  try {
    await newPayroll.save();
    res.status(201).redirect(`/${req.user.role}/payroll/manage`);
  } catch (error) {
    res.status(400).redirect(`/${req.user.role}/payroll/add`);
  }
};

module.exports.renderManagePayrollTable = async (req, res) => {
  const userType = req.session.userType;
  const payrolls = await Payroll.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("manage_payroll", { currUser, payrolls, userType });
};

module.exports.renderUpdateEmpPayrollForm = async (req, res) => {
  const userType = req.session.userType;
  let payroll = await Payroll.findById(req.params.id);
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("update_payroll", { currUser, payroll, userType });
};

module.exports.updateEmpPayroll = async (req, res) => {
  try {
    const updatedPayroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      {
        full_name: req.body.name,
        email: req.body.email,
        employee_id: req.body.id,
        salary: req.body.salary,
        payment_status: req.body.status,
        payroll_desc: req.body.notes,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPayroll) {
      return res.status(404).send("Employee Payroll details not found");
    }

    res.redirect(`/${req.user.role}/payroll/manage`);
  } catch (error) {
    res.status(500).send("Error updating Employee payroll details");
  }
};

module.exports.deleteEmpPayroll = async (req, res) => {
  try {
    const deletedPayroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!deletedPayroll) {
      return res.status(404).send("Payroll not found");
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports.renderGeneratePayrollTable = async (req, res) => {
  const userType = req.session.userType;
  const employees = await Payroll.find({});
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("generate_payroll", { currUser, employees, userType });
};

module.exports.renderEmpFinalPayroll = async (req, res) => {
  const userType = req.session.userType;
  const payroll = await Payroll.findById(req.params.id);
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("employee_payslip", { currUser, payroll, userType });
};
