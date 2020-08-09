const BodyParser = require('body-parser')
const Express = require('express')

const Database = require('./tools/Database')
const Messages = require('./tools/Messages')
const Secretary = require('./tools/Secretary')

module.exports = {
	setup: async (server) => {
		
		// Start database
		await Database.setup()

		// Setup router
		const router = Express.Router()
		server.use('/api', router)

		// Configure router
		router.use(BodyParser.json({
			limit: '20mb'
		}))

		// Middleware: Set headers
		router.use((req, res, next) => {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST, GET');
			res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-type,Authorization');
			res.setHeader('Access-Control-Allow-Credentials', true);
			next();
		});

		// Import individual route collections
		require('./routes/User')(router)
		require('./routes/Map')(router)
		require('./routes/Place')(router)

		// Set root route, configure router
		router.get('/', (req, res) => res.send('Welcome to the Interactive Map API'));

		// Middleware: Handle errors
		router.use((err, req, res, next) => {
			if (!err) return next();

			// >400: Handled errors
			if (err.handledError) {
				res.status(err.code).json({message: err.message})
			} 
			
			// 500: Unhandled errors
			else {
				console.log(err)
				res.status(Messages.codes.serverError).json({message: Messages.serverError});
			}
		});

		// Middleware: Catch all
		router.use((req, res) => {

			// 404: Request not found (not handled)
			if (!req.handled) {
				res.status(404).end()
				return;
			}

			// 200: Request completed, response prepared without errors
			Secretary.prepareResponse(res, err => {
				if (err) {
					res.status(500).json({message: Messages.serverError})
					return
				}
				res.status(200).json(res.body);
			});
		})
	}
}