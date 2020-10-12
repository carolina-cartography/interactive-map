const Mongoose = require('mongoose');
const Async = require('async');
const Database = require('./../tools/Database');
const Dates = require('./../tools/Dates');

// Map Properties: configures properties for database object
function MapProperties (schema) {
    schema.add({
		'id': {
			'type': String,
			'index': true,
			'unique': true,
			'required': true
		},
		'name': {
			'type': String,
			'index': true,
			'required': true
		},
		'user': {
			'type': String,
			'required': true,
		},
		'description': {
			'type': String,
		},
		'coordinates': {
			'type': [Number],
			'required': true,
		},
		'zoom': {
			'type': Number,
			'required': true,
		},
		'tiles': {
			'type': String,
			'required': true,
		},
    });
};

// Map Static Methods: attaches functionality used by the schema in general
function MapStaticMethods (schema) {

	// Creates a new map in the database
	schema.statics.create = function ({
		id, name, user, description, coordinates, zoom, tiles
	}, callback) {

		// Save reference to model
		var Map = this;

		// Synchronously perform the following tasks, then make callback...
		Async.waterfall([

			// Generate a unique GUID
			function (callback) {
				Map.GUID(function (err, GUID) {
					callback(err, GUID);
				})
			},

			// Write new map to the database
			function (GUID, callback) {

				// Setup query with GUID
				var query = {
					'guid': GUID
				};

				// Setup database update
				var update = {
					'$set': {
						'guid': GUID,
						'dateCreated': Dates.now(),
						id, name, user, description, coordinates, zoom, tiles
					}
				};

				// Make database update
				Database.update({
					'model': Map,
					'query': query,
					'update': update,
				}, function (err, map) {
					callback(err, map);
				});
			},

		], function (err, map) {
			callback(err, map);
		});
	};
};

// Map Instance Methods: attaches functionality related to existing instances of the object
function MapInstanceMethods (schema) {

	// Updates an existing map
	schema.methods.edit = function ({
		id, name, description, coordinates, zoom, tiles
	}, callback) {

		// Save reference to model
		var Map = this;

		// Setup query with GUID
		var query = {
			'guid': this.guid,
		};

		// Setup database update
		var set = {
			'lastModified': Dates.now(),
		};
		if (id) set.id = id;
		if (name) set.name = name;
		if (description) set.description = description;
		if (coordinates) set.coordinates = coordinates;
		if (zoom) set.zoom = zoom;
		if (tiles) set.tiles = tiles;
		var update = {
			'$set': set
		};

		// Make database update
		Database.update({
			'model': Map.constructor,
			'query': query,
			'update': update,
		}, function (err, map) {
			callback(err, map);
		});
	};

	// Deletes an existing map
	schema.methods.delete = function (callback) {
		var Map = this;
		Database.delete({
			'model': Map.constructor,
			'guid': this.guid,
		}, callback)
	};

};

// Make schema for new map object...
const mapSchema = new Mongoose.Schema;

// Inherit Object properties and methods
require('./Object')(mapSchema);

// Add map properties and methods to schema
MapProperties(mapSchema);
MapStaticMethods(mapSchema);
MapInstanceMethods(mapSchema);

// Return new model object
module.exports = Mongoose.model('Map', mapSchema)