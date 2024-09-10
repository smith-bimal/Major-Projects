const { fetchAdminDetails } = require("../utils/helper");

module.exports.rendedSurveyPage = async (req, res) => {
  const userType = req.session.userType;
  const currUser = await fetchAdminDetails(req.user.email);
  res.render("survey", { currUser, userType });
};
