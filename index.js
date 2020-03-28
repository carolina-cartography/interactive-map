const Express = require('express')
const Morgan = require('morgan')
const api = require('./api')

const REQUIRED_ENV = [
	'port',
	'secret',
	'mongo_host',
	'mongo_name',
	'mongo_user',
	'mongo_pass',
];

// Start dependenies and listen to port
async function start () {

	// Check for required environment variables
	for (const ev of REQUIRED_ENV) {
		if (process.env[ev] === undefined) {
			console.log(`Missing required env variable: ${ev}`)
			return
		}
	}

	// Setup server
	const server = Express()
	server.use(Morgan('tiny'))

	// Setup API
	await api.setup(server)

	// Setup UI routes
	server.use(Express.static('public'))
	server.get('*', function (req, res) {
	    res.sendFile('./public/index.html', {"root": "."})
	})

	// Listen on port
	server.listen(process.env.port, () => console.log(`interactive-map listening on port ${process.env.port}...`))
}

start()
