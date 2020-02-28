const Async = require('async')
const Validation = require('../tools/Validation')
const Secretary = require('../tools/Secretary')
const Messages = require('../tools/Messages')
const Authentication = require('../tools/Authentication')

const Place = require('./../model/Place')

module.exports = router => {

	router.post('/place.get', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Find all places
			(callback) => {
				Place.find({}, (err, places) => {
					Secretary.addToResponse(res, "places", places);
					callback(err, places)
				})
			},

		], err => next(err));
	})

	router.post('/place.create', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Validate parameters
			(token, callback) => {
				var validations = [];
				if (req.body.description) validations.push(Validation.string('Description', req.body.description))
				callback(Validation.catchErrors(validations), token)
			},

			// Create a new place, add to reply
			(token, callback) => {
				Place.create({
					'user': token.user,
					'description': req.body.description,
				}, (err, place) => {
					Secretary.addToResponse(res, "place", place)
					callback(err);
				});
			}

		], err => next(err));
	})

	router.post('/place.edit', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Validate parameters
			(token, callback) => {
				var validations = [
					Validation.string('GUID', req.body.guid)
				];
				if (req.body.description) validations.push(Validation.string('Description', req.body.description))
				callback(Validation.catchErrors(validations), token)
			},

			// Find place to edit, validate if user owns it
			(token, callback) => {
				Place.findOne({
					'guid': req.body.guid
				}, (err, place) => {
					if (!place) callback(Secretary.requestError(Messages.conflictErrors.objectNotFound));
					else if (place.user !== token.user) callback(Secretary.authorizationError(Messages.authErrors.noAccess));
					else callback(err, place)
				})
			},

			// Edit place, add to reply
			(place, callback) => {
				place.edit({
					'description': req.body.description,
				}, (err, place) => {
					Secretary.addToResponse(res, "place", place)
					callback(err);
				});
			}
			
		], err => next(err));
	})

	router.post('/place.delete', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Authenticate user
			callback => {
				Authentication.authenticateUser(req, function (err, token) {
					callback(err, token);
				});
			},

			// Validate parameters
			(token, callback) => {
				var validations = [
					Validation.string('GUID', req.body.guid)
				];
				callback(Validation.catchErrors(validations), token)
			},

			// Find place to delete, validate if user owns it
			(token, callback) => {
				Place.findOne({
					'guid': req.body.guid
				}, (err, place) => {
					if (!place) callback(Secretary.requestError(Messages.conflictErrors.objectNotFound));
					else if (place.user !== token.user) callback(Secretary.authorizationError(Messages.authErrors.noAccess));
					else callback(err, place)
				})
			},

			// Delete place, add to reply with "erased" property
			(place, callback) => {
				place.delete((err, place) => {
					place.erased = true;
					Secretary.addToResponse(res, "place", place)
					callback(err);
				});
			}
			
		], err => next(err));
	})
}