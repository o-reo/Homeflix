var mongoose = require('mongoose');

// Define our client schema
var ForumSchema = new mongoose.Schema({

});

// Export the Mongoose model
module.exports = mongoose.model('ForumSchema', ClientSchema);