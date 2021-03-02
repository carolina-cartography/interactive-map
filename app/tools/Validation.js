const emailRegex = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

const Validation = {

	validateFormState: function (fields, state) {
		state.fieldErrors = {};
		this.validateFieldLengths(fields, state);
		this.validateConfirmPasswordMatches(fields, state);
		this.validateEmails(fields, state);
	},

	validateFieldLengths: function (fields, state) {
		Object.entries(fields).forEach(([key, field]) => {
			if (
				(field.minLength && (!state.fieldValues[key] || state.fieldValues[key].length < field.minLength)) ||
				(field.required && (!state.fieldValues[key] || state.fieldValues[key].length < 1))
			) {
				if (!state.fieldValues[key] || state.fieldValues[key].length < 1) state.fieldErrors[key] = `${field.title} is required`;
				else state.fieldErrors[key] = `${field.title} is too short`;
			}
		})
	},

	validateConfirmPasswordMatches: function (fields, state) {
		if (state.password && state.confirmPassword) {
			if (state.password !== state.confirmPassword) {
				state.fieldErrors.confirmPassword = 'Password does not match';
			}
		}
	},

	validateEmails: function (fields, state) {
		Object.entries(fields).forEach(([key, field]) => {
			if (field.type === 'email') {
				if (!emailRegex.test(state.fieldValues[key])) {
					state.fieldErrors[key] = 'Email address is not valid';
				}
			}
		})
	},

};

export default Validation;
