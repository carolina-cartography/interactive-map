const Storage = {

	// Stores an item in localStorage
	set: function (key, json) {
		var value = JSON.stringify(json);
		window.localStorage.setItem(key, value);
	},
	
	// Accesses an item in localStorage
	get: function (key) {
		var value = window.localStorage.getItem(key);
		return JSON.parse(value);
	},
	
	// Clears all items in localStorage
	clear: function () {
		window.localStorage.clear();
	},
};

export default Storage