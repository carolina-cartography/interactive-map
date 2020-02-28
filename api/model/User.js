const Mongoose = require('mongoose');
const Async = require('async');
const Database = require('./../tools/Database');
const Dates = require('./../tools/Dates');

// User Properties: configures properties for database object
function UserProperties (schema) {
    schema.add({
		'email': {
			'type': String,
			'unique': true,
			'index': true,
			'lowercase': true,
			'required': true,
		},
		'password': {
			'type': String,
			'required': true
		},
		'name': {
			'type': String,
			'index': true,
			'required': true
		}
    });
};

// User Static Methods: attaches functionality used by the schema in general
function UserStaticMethods (schema) {

	// Creates a new user in the database
	schema.statics.create = function ({name, email, password}, callback) {

		// Save reference to model
		var User = this;

		// Synchronously perform the following tasks, then make callback...
		Async.waterfall([

			// Generate a unique GUID
			function (callback) {
				User.GUID(function (err, GUID) {
					callback(err, GUID);
				})
			},

			// Write new user to the database
			function (GUID, callback) {

				// Setup query with GUID
				var query = {
					'guid': GUID
				};

				// Setup database update
				var update = {
					'$set': {
						'guid': GUID,
						'name': name,
						'email': email,
						'password': password,
						'dateCreated': Dates.now(),
					}
				};

				// Make database update
				Database.update({
					'model': User,
					'query': query,
					'update': update,
				}, function (err, user) {
					callback(err, user);
				});
			},

		], function (err, user) {
			callback(err, user);
		});
	};
};

// User Instance Methods: attaches functionality related to existing instances of the object
function UserInstanceMethods (schema) {

	// Updates an existing user
	schema.methods.edit = function ({name}, callback) {

		// Save reference to model
		var User = this;

		// Setup query with GUID
		var query = {
			'guid': this.guid,
		};

		// Setup database update
		var set = {
			'lastModified': Dates.now(),
		};
		if (name) set.name = name;
		var update = {
			'$set': set
		};

		// Make database update
		Database.update({
			'model': User.constructor,
			'query': query,
			'update': update,
		}, function (err, user) {
			callback(err, user);
		});
	};

};

// Make schema for new user object...
const userSchema = new Mongoose.Schema;

// Inherit Object properties and methods
require('./Object')(userSchema);

// Add user properties and methods to schema
UserProperties(userSchema);
UserStaticMethods(userSchema);
UserInstanceMethods(userSchema);

// Return new model object
module.exports = Mongoose.model('User', userSchema)