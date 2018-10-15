var mongoose = require('mongoose');

var SectionForumSchema = new mongoose.Schema({
    title: { type: String, unique: true, required: true },
    description: { type: String, unique: false, required: false }
});

// Export the Mongoose model
module.exports = mongoose.model('SectionForum', SectionForumSchema);