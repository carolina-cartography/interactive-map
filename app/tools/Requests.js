import Request from 'request'
import Authentication from './Authentication'

const Requests = {

	/**
	 * Performs API request, stores the user and token properties of a response from the server
	 * @memberof modules/Requests
	 * @param {String} endpoint Endpoint to append to base API address (no slashes)
	 * @param {Object} body JSON object to send as POST request body
	 * @param {Function} callback Callback: function (error, body)
	 */
	do: (endpoint, body) => new Promise((resolve, reject) => {

		// Setup request options
		var options = {
			'method': "POST",
			'url': `${window.location.origin}/api/${endpoint}`,
			'headers': {
				'Content-Type': "application/json",
			},
			'body': JSON.stringify(body),
		};

		// Attach token if provided
		var token = Authentication.getToken();
		if (token) options.headers['Authorization'] = token;

		// Make request
		Request(options, function (error, response, body) {

			// Handle hard request errors
			if (error) {
				console.log('Request error: ',error);
				return reject({message: 'Internal error'});
			}

			// Convert response body to JSON
			if (body) body = JSON.parse(body);

			// Handle successful responses
			if (response.statusCode === 200) {
				Authentication.handleResponse(body);
				return resolve(body);
			} 
			
			// Handle error responses
			reject(body);		
		});
	}),
};

export default Requests;
