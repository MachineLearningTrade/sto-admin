const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//for the Date type in mongodb, it will automatically adjust the value to GMT+0, it is need to recover the time by adjust timezone on getting value.
let PressDataSchema= new Schema({
	publishdate:{type: Date, required: true},
	title:{type: String, required: true},
	url:{type: String, required:false},
	source:{type:String,required:false},
	createdatetime:{type: Date, default: Date.now }
		});



module.exports = mongoose.model('PressData',PressDataSchema);
