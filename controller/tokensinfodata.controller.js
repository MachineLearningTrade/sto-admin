const tokensinfodata = require('../model/tokens-info.model');
const logger = require('../lib/logger');

exports.test = function (req,res){
	res.send('Testinggggg');
};
//Name        : insert
//In          : token-info-data record in json format, post in body with batch as key
//Out         : If all records are valid according to model specification, records will be save 
//				in DB and original records will be return
//				If any validation error is occured, error will return and nothing will be save
//				in DB
//Description :Insert token info Data from json format in req body with "batch" as key and list as data , data will be save in All or nothing fashion.Those records will be validate according to Model definition before save in db.It will return error immediately on the first error encounter
exports.insert = function(req,res){
	if(req.body.batch){
		//Use insertMany to validate the doc before save, all or nothing
		tokensinfodata.insertMany(req.body.batch,function(err,docs){
				if(err){
					logger.error(`TokensInfoData insert - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
					res.status(500).send(err);
				}
				else{
					logger.info(`TokensInfoData insert - ${req.originalUrl} - ${req.method} - ${req.ip}`);
					res.json(req.body);

				}
		});		
	}
	else{
		logger.error(`TokensInfoData insert - No Batch detected - ${req.originalUrl} - ${req.method} - ${req.ip}`);
		res.status(500).send({error:"No Batch detected"});
	}

};
//Name        : getTokeninfo
//In          : Null or query with params symbol
//Out         : If Null is given as input, it will returns all token-info-data records in desc
//				order
//				If symbol is given as parameter, it will returns the specific symbol record.
//				If any error occurs, status 500 will be return with error message
//Description : Get token-info-data records, it uses symbol field for filtering, by default, it wil return all token-info-data records and if symbol param is given, it will return the specific record with the given symbol 
exports.getTokensinfo = function(req,res){
		symbol = req.query.symbol;
		if(typeof symbol !== 'undefined' && symbol){
			tokensinfodata.find({SYMBOL:symbol},function(err,docs){
					if(err){
						logger.error(`TokensInfoData getTokeninfo(S = ${symbol}) - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
						res.status(500).send(err);
					}else{
						logger.info(`TokensInfoData getTokeninfo(S = ${symbol}) -  ${req.originalUrl} - ${req.method} - ${req.ip}`);
						res.send(docs);
					}
			})
		}else{
			tokensinfodata.find({},null,{sort: {symbol:-1}},function(err,docs){
					if(err){
						logger.error(`TokensInfoData getTokeninfo(default) - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
						res.status(500).send(err);
					}else{
						logger.info(`TokensInfoData getTokeninfo(default) - ${req.originalUrl} - ${req.method} - ${req.ip}`);
						res.send(docs);
					}

					});
		}
};

