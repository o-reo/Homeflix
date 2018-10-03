var mongoose = require('mongoose');

var MovieCommentSchema = new mongoose.Schema({
    id_movie: {type: String, required: true},
    id_user: {type: String, required: true},
    content: {type: String, required: true, maxlength: 255},
    time: { type: Date, default: () => { return new Date() } }
});

// Export the Mongoose model
module.exports = mongoose.model('MovieComment', MovieCommentSchema);