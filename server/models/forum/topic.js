var mongoose = require('mongoose');

var TopicSchema = new mongoose.Schema({
    id_sectionForum: {type: String, unique: false, required: true},
    id_author: { type: String, unique: false, required: true },
    title: { type: String, unique: true, required: true },
    content: { type: String, unique: false, required: true },
    time: { type: Date, default: () => { return new Date() } }
});

// Export the Mongoose model
module.exports = mongoose.model('Topic', TopicSchema);