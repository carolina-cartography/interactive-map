# Interactive Map
An application that allows users to sign up and create markers on a map

## Installation
Create the following `config.js` file in the project's root directory:
```
module.exports = {
	port: <port to listen for requests on>,
	database: {
		host: "<hostname or IP of mongo database>",
		name: "<name of mongo database>",
		username: "<user for mongo database>",
		password: "<password for user>",
	},
	secret: "<secure sting for authentication encryption>",
}
```