var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var linkSchema= new Schema({
	original_url: String,
	short_url: Number
});

module.exports = mongoose.model('Link', linkSchema)