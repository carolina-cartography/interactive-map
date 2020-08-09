const Token = require('jsonwebtoken');
const Dates = require('./Dates');
const Secretary = require('./Secretary');
const Messages = require('./Messages');

// Helper functions
function getTokenFromRequest (request) {
	if (!request.headers) return null;
	return request.headers.authorization;
};

function isAdminEmail (email) {
	const admins = process.env.admins
		if (admins !== undefined) {
			adminEmails = admins.split(",")
			if (adminEmails.includes(email)) {
				return true
			}
		}
	return false
}

function authenticateUser (request, callback) {
	const token = getTokenFromRequest(request);
	if (!token) return callback(Secretary.authorizationError(Messages.authErrors.missingToken));
	const pureToken = token.replace('Bearer ', '');
	Token.verify(pureToken, process.env.secret, function (err, decodedToken) {
		if (decodedToken) return callback(null, decodedToken);
		callback(Secretary.authorizationError(Messages.authErrors.unauthorized));
	});
}

module.exports = {

	// Expose internal functions
	isAdminEmail: email => isAdminEmail(email),
	authenticateUser: (request, callback) => authenticateUser(request, callback),

	makeUserToken: (user, callback) => {
		const signedObject = {
			'user': user.guid,
			'email': user.email,
			'exp': parseInt(Dates.fromNow(60, 'days')),
		};
		Token.sign(signedObject, process.env.secret, function (err, token) {
			callback(err, token);
		});
	},
	authenticateAdminUser: (request, callback) => {
		authenticateUser(request, (err, token) => {
			if (token && !isAdminEmail(token.email)) 
				return callback(Messages.authErrors.notAdmin)
			callback(err, token)
		})
	},
}