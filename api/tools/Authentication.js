const Token = require('jsonwebtoken');
const Dates = require('./Dates');
const Secretary = require('./Secretary');
const Messages = require('./Messages');

const { secret } = require('./../../config')

// Helper functions
function getTokenFromRequest (request) {
	if (!request.headers) return null;
	return request.headers.authorization;
};

module.exports = {
	makeUserToken: (user, callback) => {
		const signedObject = {
			'user': user.guid,
			'exp': parseInt(Dates.fromNow(60, 'days')),
		};
		Token.sign(signedObject, secret, function (err, token) {
			callback(err, token);
		});
	},
	authenticateUser: (request, callback) => {
		const token = getTokenFromRequest(request);
		if (!token) return callback(Secretary.authorizationError(Messages.authErrors.missingToken));
		const pureToken = token.replace('Bearer ', '');
		Token.verify(pureToken, secret, function (err, decodedToken) {
			if (decodedToken) return callback(null, decodedToken);
			callback(Secretary.authorizationError(Messages.authErrors.unauthorized));
		});
	},
}