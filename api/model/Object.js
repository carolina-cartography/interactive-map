const Uuid = require('uuid');

// Object Properties: configures properties for database object
function ObjectProperties (schema) {
    schema.add({

		// GUID: a unique identified for an object
        'guid': {
            'type': String,
            'index': true,
            'unique': true
        },

		// Date Created: this time this object was created
		'dateCreated': {
			'type': Number,
		},

        // Last Modified: the time this object was last modified
        'lastModified': {
            'type': Number,
            'index': true
        },
    });
}

function ObjectInstanceMethods (schema) {

	// Formats an existing object
	schema.methods.format = function (callback) {
		callback(null, this.toObject())
	};
}

// Object Static Methods: attaches functionality used by the schema in general
function ObjectStaticMethods (schema) {

	// Generates a guaranteed unique GUID for a Mongo collection
	schema.statics.GUID = function (callback) {

		// Save reference to model object
		var model = this;

		// Generate a new GUID
		var GUID = Uuid.v4();

		// Check for uniqueness
		model.findOne({
			'guid': GUID
		}, function(err, object) {

			// If an object exists, recursively make another GUID.
			if (object) return model.GUID(callback);

			// Otherwise, callback with GUID
			callback(err, GUID);
		});
	};

};

// Export object properties and methods
module.exports = function (schema) {
	ObjectProperties(schema);
	ObjectInstanceMethods(schema);
	ObjectStaticMethods(schema);
}
