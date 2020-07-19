const Mongoose = require('mongoose')
const Async = require('async')
const Database = require('../tools/Database')
const Dates = require('../tools/Dates')
const User = require('./User');

const baseSchema = {
	'user': {
		'type': String,
		'index': true,
		'required': true,
	},
	'map': {
		'type': String,
		'index': true,
	},
	'metadata': {
		'type': Object,
		'default': {},
	},
}

function PlaceProperties (schema) {
	let placeSchema = baseSchema;
	placeSchema.location = {
		'type': {
			'type': String,
			'default': "Point"
		},
		'coordinates': {
			'type': [Number],
			'index': "2dsphere",
		}
	};
    schema.add(placeSchema);
};

function PolygonProperties (schema) {
	let polygonSchema = baseSchema;
	polygonSchema.location = {
		'type': {
			'type': String,
			'default': "Polygon"
		},
		'coordinates': {
			'type': [[[Number]]],
			'index': "2dsphere",
		}
	};
    schema.add(polygonSchema);
};

function PlaceStaticMethods (schema) {

	// Create: creates a new place in the database
	schema.statics.create = function ({user, map, coordinates, metadata}, callback) {

		// Save reference to model
		var Place = this;

		// Synchronously perform the following tasks, then make callback...
		Async.waterfall([

			// Generate a unique GUID
			function (callback) {
				Place.GUID(function (err, GUID) {
					callback(err, GUID);
				})
			},

			// Write new place to the database
			function (GUID, callback) {

				// Setup query with GUID
				var query = {
					'guid': GUID
				};

				// Setup database update with required fields
				let set = {
					guid: GUID,
					user,
					location: {
						coordinates,
					},
					map,
					dateCreated: Dates.now(),
				}

				// Setup database update with optional fields
				if (metadata) set.metadata = metadata;
				
				// Make database update
				Database.update({
					model: Place,
					query: query,
					update: {'$set': set},
				}, function (err, place) {
					callback(err, place);
				});
			},

		], function (err, place) {
			callback(err, place);
		});
	};
};

function PlaceInstanceMethods (schema) {

	schema.methods.format = function (callback) {
		let thisPlace = this.toObject();
		Async.waterfall([

			// Add user name to place
			(callback) => {
				User.findOne({
					guid: thisPlace.user,
				}, (err, user) => {
					thisPlace.userName = user.name;
					callback(err)
				})
			}

		], (err) => {
			callback(err, thisPlace)
		});
	};

	schema.methods.edit = function ({coordinates, metadata}, callback) {

		// Save reference to model
		var Place = this;

		// Setup query with GUID
		var query = {
			guid: this.guid,
		};

		// Setup database update with required fields
		var set = {
			lastModified: Dates.now(),
		};
		var unset = {}

		// Setup database update with optional fields
		if (coordinates) set.location = { coordinates };
		if (metadata) {
			for (var key in metadata) {
				if (metadata[key] === null) unset[`metadata.${key}`] = true;
				else set[`metadata.${key}`] = metadata[key];
			}
		}

		// Make database update
		Database.update({
			model: Place.constructor,
			query: query,
			update: {'$set': set, '$unset': unset},
		}, function (err, place) {
			callback(err, place);
		});
	};

	schema.methods.delete = function (callback) {

		// Save reference to model
		var Place = this;

		Place.deleteOne({
			guid: this.guid,
		}, function (err, place) {
			callback(err, place);
		});
	};

};

// Make schema for new place and new polygon object
const placeSchema = new Mongoose.Schema;
const polygonSchema = new Mongoose.Schema;

// Inherit Object properties and methods
require('./Object')(placeSchema);
require('./Object')(polygonSchema);

// Setup distinct properties for place and polygon
PlaceProperties(placeSchema);
PolygonProperties(polygonSchema);

// Add methods to both schemas
PlaceStaticMethods(placeSchema);
PlaceInstanceMethods(placeSchema);
PlaceStaticMethods(polygonSchema);
PlaceInstanceMethods(polygonSchema);

// Return new model object
module.exports = {
	Place: Mongoose.model('Place', placeSchema),
	Polygon: Mongoose.model('Polygon', polygonSchema)
}