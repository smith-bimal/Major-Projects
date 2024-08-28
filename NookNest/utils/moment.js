const moment = require("moment");

const now = moment();

function checkAge(date){
    const past = moment(date, 'ddd MMM DD YYYY HH:mm:ss [GMT]ZZ (z)');
    const monthsDifference = now.diff(past, 'months');
    const yearsDifference = now.diff(past, 'years');

    return (
        {
            yearsDifference,
            monthsDifference,
        }
    )
}

module.exports = checkAge;