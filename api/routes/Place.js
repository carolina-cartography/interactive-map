const Async = require('async')
const Validation = require('../tools/Validation')
const Secretary = require('../tools/Secretary')
const Messages = require('../tools/Messages')
const Authentication = require('../tools/Authentication')

const { Place, Polygon, Circle } = require('./../model/Place')

module.exports = router => {

	router.post('/place.get', (req, res, next) => {
		req.handled = true;

		let allPlaces = [];

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Validate parameters
			(callback) => {
				var validations = [
					Validation.string('Map', req.body.map)
				];
				callback(Validation.catchErrors(validations))
			},

			// Find Places for map
			(callback) => {
				Place.find({
					map: req.body.map,
				}, (err, places) => {
					if (places) places.forEach(place => allPlaces.push(place))
					callback(err)
				})
			},

			// Find Polgyons for map
			(callback) => {
				Polygon.find({
					map: req.body.map,
				}, (err, polygons) => {
					if (polygons) polygons.forEach(polygon => allPlaces.push(polygon))
					callback(err)
				})
			},

			// Find Circles for map
			(callback) => {
				Circle.find({
					map: req.body.map,
				}, (err, circles) => {
					if (circles) circles.forEach(circle => allPlaces.push(circle))
					callback(err)
				})
			},

			// Give all places array to secretary
			(callback) => {
				Secretary.addToResponse(res, "places", allPlaces)
				callback()
			}

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
				var validations = [
					Validation.placeType('Type', req.body.type),
					Validation.coordinates('Coordinates', req.body.coordinates, req.body.type),
					Validation.string('Map', req.body.map)
				];
				if (req.body.radius) validations.push(Validation.number('Radius', req.body.radius))
				if (req.body.metadata) validations.push(Validation.metadata('Metadata', req.body.metadata))
				callback(Validation.catchErrors(validations), token)
			},

			// Create a new place, add to reply
			(token, callback) => {
				let options = {
					'user': token.user,
					'map': req.body.map,
					'coordinates': req.body.coordinates,
					'metadata': req.body.metadata,
				};

				let model;
				if (req.body.type === "point") model = Place;
				else if (req.body.type === "polygon") model = Polygon;
				else if (req.body.type === "circle") {
					model = Circle;
					options.radius = req.body.radius
				}

				model.create(options, (err, place) => {
					Secretary.addToResponse(res, "place", place)
					callback(err);
				});
			}

		], err => next(err));
	})

	router.post('/place.edit', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		let model;
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
					Validation.string('GUID', req.body.guid),
					Validation.placeType('type', req.body.type),
				];
				if (req.body.coordinates) validations.push(Validation.coordinates('Coordinates', req.body.coordinates))
				if (req.body.metadata) validations.push(Validation.metadata('Metadata', req.body.metadata))
				if (req.body.radius) validations.push(Validation.number('Radius', req.body.radius))
				callback(Validation.catchErrors(validations), token)
			},

			// Find place to edit, validate if user owns it
			(token, callback) => {
				switch(req.body.type) {
					case "point":
						model = Place;
						break;
					case "polygon":
						model = Polygon;
						break;
					case "circle":
						model = Circle;
						break;
					default:
						return callback("Invalid place type")
				}
				model.findOne({
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
					'coordinates': req.body.coordinates,
					'radius': req.body.radius,
					'metadata': req.body.metadata,
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