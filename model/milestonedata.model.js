const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//for the Date type in mongodb, it will automatically adjust the value to GMT+0, it is need to recover the time by adjust timezone on getting value.
let MileStoneDataSchema= new Schema({
	date:{type: Date, required: true},
	desc:{type: String, required: true},
	exturl:{type: String, required:false},
	isvideo:{type: Boolean, default: false }
		});



module.exports = mongoose.model('MileStoneData',MileStoneDataSchema);
