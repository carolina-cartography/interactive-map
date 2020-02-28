/** @namespace tools/Secretary */

const Async = require('async')
const Messages = require('./Messages')

const privateKeys = [
	"_id",
	"__v",
	"password"
];

function createError(code, message) {
	return {
		'code': code,
		'message': message,
		'handledError': true,
	};
};

function removePrivateKeys(object) {
	for (var i in privateKeys) delete object[privateKeys[i]];
	return object;
}

module.exports = {
	requestError: message => {
		return createError(Messages.codes.requestError, message);
	},
	conflictError: message => {
		return createError(Messages.codes.conflictError, message);
	},
	authorizationError: message => {
		return createError(Messages.codes.unauthorizedError, message);
	},
	serverError: message => {
		if (message) return createError(Messages.codes.serverError, message);
		return createError(Messages.codes.serverError, Messages.serverError);
	},
	addToResponse: (response, key, value, noFormat) => {
		if (noFormat) {
			if (!response.body) response.body = {};
			response.body[key] = value;
		} else {
			if (!response.toFormat) response.toFormat = {};
			response.toFormat[key] = value;
		}
	},
	prepareResponse(response, callback) {

		// Return if no objectsToFormat
		if (!response.toFormat) {
			callback();
			return;
		}
	
		// Initialize response body
		if (!response.body) response.body = {};
	
		// Format all objects in objectsToFormat
		Async.eachOf(response.toFormat, (object, key, callback) => {
			if (object instanceof Array) {
				var formattedObjects = new Array(object.length);
				Async.eachOf(object, (arrayObject, index, callback) => {
					arrayObject.format((err, formattedObject) => {
						if (formattedObject) formattedObjects[index] = removePrivateKeys(formattedObject);
						callback(err);
					});
				}, err => {
					response.body[key] = formattedObjects;
					callback(err);
				})
			} else {
				object.format((err, formattedObject) => {
					if (formattedObject) response.body[key] = removePrivateKeys(formattedObject);
					callback(err);
				});
			}
		}, function (err) {
			callback(err);
		});
	},
};
