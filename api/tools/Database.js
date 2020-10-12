const Mongoose = require('mongoose')

module.exports = {

	setup: () => {
		process.stdout.write(`Connecting to Mongo at ${process.env.mongo_host}...`)
		const auth = `${process.env.mongo_user}:${process.env.mongo_pass}`
		return Mongoose.connect(`mongodb://${auth}@${process.env.mongo_host}/${process.env.mongo_name}`, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
			useFindAndModify: false,
		}).then(() => {
			process.stdout.write(' done!\n')
		}).catch(err => {
			process.stderr.write('Database error: '+err.stack+'\n')
			process.exit(0)
		})
	},

	update: ({model, query, update}, callback) => {

		// Setup options
		var options = {
			'setDefaultsOnInsert': true, // Adds default properties to database object
			'runValidators': true, // Allows mongoDB to validate update
			'new': true, // Returns the modified document
			'upsert': true, // If a document isn't found, make one based on query
		};

		// Setup query
		if (!update.$set) update.$set = {}; // Make a set operation if one isn't defined in the update
		if (!update.$setOnInsert) update.$setOnInsert = {}; // Make a setOnInsert operation if one isn't defined in the update

		// Make query and update with Mongoose
		model.findOneAndUpdate(query, update, options, function (err, object) {
			callback(err, object);
		});
	},

	delete: ({model, guid}, callback) => {
		model.deleteOne({ guid }, callback);
	},
}


