const Express = require('express')
const Morgan = require('morgan')
const api = require('./api')

const { port } = require('./config')

async function start () {

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
	server.listen(port, () => console.log(`interactive-map listening on port ${port}...`))
}

start()
