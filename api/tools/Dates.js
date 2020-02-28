const Moment = require('moment');

module.exports = {
	now: function () {
		return Moment().format('X');
	},
};