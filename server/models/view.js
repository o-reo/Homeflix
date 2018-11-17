const mongoose = require('mongoose');

const ViewSchema = new mongoose.Schema({
    imdbid: {
        type: String,
        required: true
    }
});

const View = module.exports = mongoose.model('View', ViewSchema);