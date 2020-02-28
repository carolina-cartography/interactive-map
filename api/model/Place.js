const Mongoose = require('mongoose')
const Async = require('async')
const Database = require('../tools/Database')
const Dates = require('../tools/Dates')

function PlaceProperties (schema) {
    schema.add({
		'user': {
			'type': String,
			'index': true,
			'required': true,
		},
		'description': {
			'type': String,
			'index': true,
		},
    });
};

function PlaceStaticMethods (schema) {

	// Create: creates a new place in the database
	schema.statics.create = function ({user, description}, callback) {

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

				// Setup database update
				let update = {
					'$set': {
						'guid': GUID,
						'user': user,
						'description': description,
						'dateCreated': Dates.now(),
					}
				};
				
				// Make database update
				Database.update({
					'model': Place,
					'query': query,
					'update': update,
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
	schema.methods.edit = function ({description}, callback) {

		// Save reference to model
		var Place = this;

		// Setup query with GUID
		var query = {
			'guid': this.guid,
		};

		// Setup database update
		var set = {
			'lastModified': Dates.now(),
		};
		if (description) set.description = description;
		var update = {
			'$set': set
		};

		// Make database update
		Database.update({
			'model': Place.constructor,
			'query': query,
			'update': update,
		}, function (err, place) {
			callback(err, place);
		});
	};

	schema.methods.delete = function (callback) {

		// Save reference to model
		var Place = this;

		Place.deleteOne({
			'guid': this.guid,
		}, function (err, place) {
			callback(err, place);
		});
	};

};

// Make schema for new place object
const placeSchema = new Mongoose.Schema;

// Inherit Object properties and methods
require('./Object')(placeSchema);

// Add place properties and methods to schema
PlaceProperties(placeSchema);
PlaceStaticMethods(placeSchema);
PlaceInstanceMethods(placeSchema);

// Return new model object
module.exports = Mongoose.model('Place', placeSchema)