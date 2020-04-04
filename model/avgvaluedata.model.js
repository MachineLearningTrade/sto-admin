const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//for the Date type in mongodb, it will automatically adjust the value to GMT+0, it is need to recover the time by adjust timezone on getting value.
let AvgValueDataSchema= new Schema({
	HOLDERADDRESS:{type:String, required: true },
	SYMBOL:{type: String, required: true, },
	MANUAL:{type: Boolean, required: false,default: false},
	PRICE:{type :Schema.Types.Decimal128 , required: false},
	QTY:{type :Schema.Types.Decimal128 , required: false},
	CURRENTAVGVALUE:{type :Schema.Types.Decimal128 , required: false},
	},{timestamps: true});

	AvgValueDataSchema.index({HOLDERADDRESS:1 , SYMBOL:1},{unique: true});

module.exports = mongoose.model('AvgValueData',AvgValueDataSchema);
