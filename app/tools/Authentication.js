import Storage from './Storage';

export default {

	// Stores the user and token properties of a response from the server
	handleResponse: body => {
		if (body.token) Storage.set('token', body.token);
		if (body.user) Storage.set('user', body.user);
	},

	// Clears all saved data
	logout: () => {
		Storage.clear();
	},

	// Returns authentication boolean
	isAuthenticated: () => {
		return Storage.get('token') || false
	},

	// Returns admin boolean
	isAdmin: () => {
		let user = Storage.get('user')
		if (user && user.admin) return true;
		return false;
	},

	// Returns authentication token
	getToken: () => {
		return Storage.get('token')
	},

	// Returns user object
	getUser: () => {
		return Storage.get('user')
	},
}
