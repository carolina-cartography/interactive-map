module.exports = {
	'codes': {
		'success': 200,
		'serverError': 500,
		'requestError': 400,
		'unauthorizedError': 401,
		'notFoundError': 404,
		'conflictError': 409
	},
	'authErrors': {
		'invalidToken': "Invalid token",
		'missingToken': "Missing authorization token",
		'unauthorized': "Unauthorized",
		'noAccess': "Unauthorized to access object",
		'notAdmin': "Only administrators can perform this action",
	},
	'typeErrors': {
		'string': " is not a string",
		'emptyString': " is an empty string",
		'number': " is not a number",
		'array': " is not an array",
	},
	'fieldErrors': {
		'missing': " is missing",
		'passwordLetter': " is missing a letter",
		'passwordNumber': " is missing a number",
		'isInvalid': " is invalid",
		'sortKey': " is not a valid sort key",
		'invalidPlaceType': " must be 'place' or 'polygon'.",
	},
	'conflictErrors': {
		'objectNotFound': "Object not found in the database",
		'emailAlreadyUsed': "An account with this email already exists",
		'idAlreadyUsed': "A map with this ID already exists",
		'emailNotFound': "Email not recognized",
		'passwordIncorrect': "Incorrect password",
	}
};