const Async = require('async')
const HashPassword = require('password-hash')

const Validation = require('./../tools/Validation')
const Secretary = require('./../tools/Secretary')
const Messages = require('./../tools/Messages')
const Authentication = require('./../tools/Authentication')

const User = require('./../model/User')

module.exports = router => {

	router.post('/user.get', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Find and return user from token
			(token, callback) => {
				User.findOne({
					'guid': token.user,
				}, (err, user) => {
					if (!user) return callback(Secretary.conflictError(Messages.authErrors.invalidToken));
					Secretary.addToResponse(res, 'user', user);
					callback(err);
				});
			}

		], err => next(err));
	})

	router.post('/user.create', (req, res, next) => {
		req.handled = true;

		// Validate all fields
		var validations = [
			Validation.email('Email', req.body.email),
			Validation.password('Password', req.body.password),
			Validation.string('Name', req.body.name)
		];
		var err = Validation.catchErrors(validations);
		if (err) return next(err);

		// Hash password
		var password = HashPassword.generate(req.body.password);

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Check if email is unique
			callback => {
				User.findOne({
					'email': req.body.email,
				}, (err, user) => {
					if (user) callback(Secretary.conflictError(Messages.conflictErrors.emailAlreadyUsed));
					else callback(err);
				});
			},

			// Create a new user, add to reply
			callback => {
				User.create({
					'name': req.body.name,
					'email': req.body.email,
					'password': password,
				}, (err, user) => {
					if (user) Secretary.addToResponse(res, "user", user)
					callback(err, user);
				});
			},

			// Create an authentication token for user, add to reply
			(user, callback) => {
				Authentication.makeUserToken(user, (err, token) => {
					if (token) Secretary.addToResponse(res, "token", token, true)
					callback(err);
				});
			},

		], err => next(err));
	})

	router.post('/user.login', (req, res, next) => {
		req.handled = true;

		// Validate all fields
		var validations = [
			Validation.email('Email', req.body.email),
			Validation.password('Password', req.body.password)
		];
		var err = Validation.catchErrors(validations);
		if (err) return next(err);

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Find user with email
			callback => {
				User.findOne({
					'email': req.body.email,
				}, (err, user) => {
					if (!user) callback(Secretary.conflictError(Messages.conflictErrors.emailNotFound));
					else callback(err, user);
				});
			},

			// Check password, add to request if correct
			(user, callback) => {
				if (HashPassword.verify(req.body.password, user.password)) {
					callback(null, user);
					Secretary.addToResponse(res, "user", user);
				} else {
					callback(Secretary.conflictError(Messages.conflictErrors.passwordIncorrect));
				}
			},

			// Create an authentication token for user, add to reply
			(user, callback) => {
				Authentication.makeUserToken(user, (err, token) => {
					if (token) Secretary.addToResponse(res, "token", token, true)
					callback(err);
				});
			},

		], err => next(err));
	})

}
