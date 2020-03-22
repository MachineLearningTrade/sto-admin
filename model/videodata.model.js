const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//for the Date type in mongodb, it will automatically adjust the value to GMT+0, it is need to recover the time by adjust timezone on getting value.
let VideoDataSchema= new Schema({
	title:{type: String, required: true},
	url:{type: String, required:false},
	validFrom:{type:Date, required:false },
	validTo:{type:Date, required:false }
		});



module.exports = mongoose.model('VideoData',VideoDataSchema);
