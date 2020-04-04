const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//for the Date type in mongodb, it will automatically adjust the value to GMT+0, it is need to recover the time by adjust timezone on getting value.
let PriceHistorySchema= new Schema({
	SYMBOL:{type: String, required: true },
	MANUAL:{type: Boolean, required: false, default: false},
	PRICE:{type :Schema.Types.Decimal128 , required: false},
	CURRENCY:{type :String , required: false},
	},{timestamps: true});


module.exports = mongoose.model('PriceHistory',PriceHistorySchema);
