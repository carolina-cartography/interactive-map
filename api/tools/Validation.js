const Messages = require('./Messages');
const Secretary = require('./Secretary');

// Validation helper functions =================================================
function getErrorsFromArray (errors) {
	for (var i in errors) {
		if (errors[i]) {
			return (errors[i]);
		}
	}
	return null;
}

function getNamedErrorFromArray (errors, name) {
	var error = getErrorsFromArray(errors);
	if (error) return name + error;
	return null;
};

// Type validation functions ===================================================
function isInvalidString (input) {
	if (input === null || input === undefined)
		return Messages.fieldErrors.missing;
	if (!(typeof input === 'string' || input instanceof String))
		return Messages.typeErrors.string;
	if (input == "")
		return Messages.typeErrors.emptyString;
	return null;
};

function isInvalidNumber (input) {
	if (input === null)
		return Messages.fieldErrors.missing;
	if (!(typeof input === 'number'))
		return Messages.typeErrors.number;
	return null;
};

function isInvalidArray (input) {
	if (!(input instanceof Array))
		return Messages.typeErrors.array;
	return null;
};

// String validation functions =================================================
function isInvalidLength (input, minlength, maxlength) {
	if (input === null || input === undefined) 
		return " must be defined";
	if (minlength && input.length < minlength)
		return " must be " +  minlength + " characters";
	if (maxlength && input.length > maxlength)
		return " must be less than " + maxlength + " characters";
	return null;
}

// Number validation functions =================================================
function isInvalidSize (input, min, max) {
	if (min !== undefined && input < min)
		return " must be greater than " + min;
	if (max !== undefined && input > max)
		return " must be less than " + max;
	return null;
}

// Custom validation functions =================================================
function isInvalidEmail (input) {
	var emailRegExp = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
	if (!emailRegExp.test(input)) return Messages.fieldErrors.isInvalid;
	return null;
};

function isInvalidPassword (input) {
	if (input === null || input === undefined) 
		return " must be defined";
	if (input.search(/[a-zA-Z]/) == -1)
		return Messages.fieldErrors.passwordLetter;
	if (input.search(/\d/) == -1)
		return Messages.fieldErrors.passwordNumber;
	return null;
};

function isInvalidSort (input) {
	if (
		input == "asc" ||
		input == "desc"
	) return null;
	return Messages.fieldErrors.sortKey;
};

function isInvalidPointCoordinates (input) {
	for (var i in input) {
		if (isNaN(input[i])) return Messages.fieldErrors.isInvalid;
	}
}

function isInvalidPolygonCoordinates (input) {
	// Come back to
}

function isInvalidPlaceType (input) {
	switch(input) {
		case "point":
		case "polygon":
			return;
		default:
			return Messages.fieldErrors.invalidPlaceType;
	}
}

// Exports =====================================================================

module.exports.catchErrors = function (errors) {
	var errorMessage = getErrorsFromArray(errors);
	if (errorMessage) return Secretary.requestError(errorMessage);
	return null;
};

module.exports.email = function (name, input) {
	return getNamedErrorFromArray([
		isInvalidString(input),
		isInvalidEmail(input)
	], name);
};

module.exports.password = function (name, input) {
	return getNamedErrorFromArray([
		isInvalidString(input),
		isInvalidLength(input, 8),
		isInvalidPassword(input)
	], name);
};

module.exports.string = function (name, input) {
	return getNamedErrorFromArray([
		isInvalidString(input),
	], name);
};

module.exports.number = function (name, input) {
	return getNamedErrorFromArray([
		isInvalidNumber(input),
	], name);
};

module.exports.currency = function (name, input) {
	return getNamedErrorFromArray([
		isInvalidNumber(input),
	], name);
};

module.exports.pageSize = function (name, input) {
	return getNamedErrorFromArray([
		isInvalidNumber(input),
		isInvalidSize(input, 1, 2000),
	], name);
};

module.exports.sort = function (name, input) {
	return getNamedErrorFromArray([
		isInvalidString(input),
		isInvalidSort(input),
	], name);
};

module.exports.coordinates = function (name, input, type) {
	let validations = [
		isInvalidArray(input)
	];
	if (type === "point") validations.push(isInvalidPointCoordinates(input))
	else if (type === "polygon") validations.push(isInvalidPolygonCoordinates(input))
	return getNamedErrorFromArray(validations, name);
};

module.exports.placeType = function (name, input) {
	return getNamedErrorFromArray([
		isInvalidString(input),
		isInvalidPlaceType(input),
	], name);
}

module.exports.metadata = function (name, input) {
	return; // Don't validate for now
}