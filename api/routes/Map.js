const Async = require('async')
const Validation = require('./../tools/Validation')
const Secretary = require('./../tools/Secretary')
const Messages = require('./../tools/Messages')
const Map = require('./../model/Map')

module.exports = router => {

	router.post('/map.get', (req, res, next) => {
		req.handled = true;

		var validations = [
			Validation.string('ID', req.body.id)
		];
		var err = Validation.catchErrors(validations);
		if (err) return next(err);

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Find and return map using ID
			(callback) => {
				Map.findOne({
					'id': req.body.id,
				}, (err, map) => {
					if (!map) return callback(Secretary.conflictError(`Map '${req.body.id}' not found`));
					Secretary.addToResponse(res, 'map', map);
					callback(err);
				});
			}

		], err => next(err));
	})

	router.post('/map.list', (req, res, next) => {
		req.handled = true;

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Find and return map using ID
			(callback) => {
				Map.find({}, (err, maps) => {
					Secretary.addToResponse(res, 'maps', maps);
					callback(err);
				});
			}

		], err => next(err));
	})

	router.post('/map.create', (req, res, next) => {
		req.handled = true;

		// Validate all fields
		var validations = [
			Validation.string('ID', req.body.id),
			Validation.string('Name', req.body.name),
			Validation.string('Description', req.body.description),
			Validation.coordinates('Coordinates', req.body.coordinates),
			Validation.number('Zoom', req.body.zoom),
			Validation.string('Tiles URL', req.body.tiles)
		];
		var err = Validation.catchErrors(validations);
		if (err) return next(err);

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Check if ID is unique
			callback => {
				Map.findOne({
					'id': req.body.id,
				}, (err, map) => {
					if (map) callback(Secretary.conflictError(Messages.conflictErrors.idAlreadyUsed));
					else callback(err);
				});
			},

			// Create a new map, add to reply
			callback => {
				Map.create(req.body, (err, map) => {
					if (map) Secretary.addToResponse(res, "map", map)
					callback(err, map);
				});
			},

		], err => next(err));
	})

	router.post('/map.edit', (req, res, next) => {
		req.handled = true;

		// Validate all fields
		var validations = [
			Validation.string('GUID', req.body.guid)
		];
		if (req.body.id) validations.push(Validation.string('ID', req.body.id))
		if (req.body.name) validations.push(Validation.string('Name', req.body.name))
		if (req.body.description) validations.push(Validation.string('Description', req.body.description))
		if (req.body.coordinates) validations.push(Validation.coordinates('Coordinates', req.body.coordinates))
		if (req.body.zoom) validations.push(Validation.number('Zoom', req.body.zoom))
		if (req.body.tiles) validations.push(Validation.string('Tiles URL', req.body.tiles))
		var err = Validation.catchErrors(validations);
		if (err) return next(err);

		// Synchronously perform the following tasks...
		Async.waterfall([

			// Find map with GUID
			callback => {
				Map.findOne({
					'guid': req.body.guid,
				}, (err, map) => {
					if (!map) callback(Secretary.conflictError(Messages.conflictErrors.objectNotFound));
					else callback(err, map);
				});
			},

			// Edit map, add to reply
			(map, callback) => {
				map.edit(req.body, (err, map) => {
					if (map) Secretary.addToResponse(res, "map", map)
					callback(err, map);
				});
			},

		], err => next(err));
	})

}
