var mongoose = require('mongoose');

var MessageSchema = new mongoose.Schema({
    id_topic: { type: String, unique: false, required: true },
    id_sectionForum: { type: String, unique: false, required: true},
    id_author: { type: String, unique: false, required: true },
    content: { type: String, unique: false, required: true },
    time: { type: Date, default: () => { return new Date() } }
});

// Export the Mongoose model
module.exports = mongoose.model('message', MessageSchema);