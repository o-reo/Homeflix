var mongoose = require('mongoose');

var MovieSchema = new mongoose.Schema({
    api: { type: String, required: true }, // ex : yts, pirate bay, etc ...
    id_api: { type: String, required: true }, // l'id dans le la db de l'API.
    hash: { type: String, required: true }
});

// Export the Mongoose model
module.exports = mongoose.model('Movie', MovieSchema);