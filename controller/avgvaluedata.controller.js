const avgvaluedata = require('../model/avgvaluedata.model');
//const request = require('request');
const request = require('axios');
const logger = require('../lib/logger');

const getdata = async function(req,res,s){
	let lastprice =0;
	let avgdata ={};
	let response={};
	let holding=null;
	try{
		response = await request.post(`${req.app.hosturl}/pricehistory/getprice?symbol=${s}&currency=HKD`)
		for(var i=0;i<response.data.length;i++){
			lastprice=response.data[i].PRICE['$numberDecimal']*1;
			logger.info(`-- 1. AvgValueData updateavgvalue for Symbol : ${response.data[i].SYMBOL} get lastprice : ${lastprice}`);
		}
	}catch(error){
		//getprice error
		logger.error(`-- 1. AvgValueData updateavgvalue() -S:=${s} - getprice error - ${error}}`);
		res.status(500).json({"function":"AvgValueData updateavgvalue()","error":"getPrice error","detail":error});
	}	
	try{
		response = await request.post(`${req.app.hosturl}/avgvaluedata/getavgvaluedata?symbol=${s}`);
		avgdata = response.data;
		logger.info(`-- 2. AvgValueData updateavgvalue for Symbol : ${s} getavgvaluedata`);
		logger.debug(`-- Symbol : ${s} getavgvaluedata key length : ${Object.keys(avgdata).length}`);
	}catch(error){
		logger.error(`-- 2. AvgValueData updateavgvalue() -S:=${s} - getavgvaluedata error -${error}`);
		res.status(500).json({"function":"AvgValueData getavgvaluedata()","error":"getavgvaluedata error","detail":error});
	}
	try{
		response= await request.get(`${req.app.hosturl}/tokendymanic/getbalances/${s}`);
		logger.info(`-- 3. AvgValueData updateavgvalue for S: ${s} getbalances`);
		holding=response.data["data"];
		logger.debug(`-- Symbol : ${s} getbalances key length: ${Object.keys(holding).length}`);
	}catch(error){
		logger.error(`-- 3. AvgValueData updateavgvalue() -S: ${s} - getbalances error - ${error}`);
		res.status(500).json({"function":"AvgValueData getavgvaluedata()","error":"getbalances error","detail":error});
	}
	return [lastprice,avgdata,holding];
};

exports.test = function (req,res){
	res.send('Testinggggg');
};


//Name        : insert
//In          : press record in json format, post in body with batch as key
//Out         : If all records are valid according to model specification, records will be save 
//Description :
exports.insert = function(req,res){
	if(req.body.batch){
		//Use insertMany to validate the doc before save, all or nothing
		avgvaluedata.insertMany(req.body.batch,function(err,docs){
				if(err){
					logger.error(`AvgValueData insert - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
					res.status(500).send(err);
				}
				else{
					logger.info(`AvgValueData insert - ${req.originalUrl} - ${req.method} - ${req.ip}`);
					res.json(req.body);

				}
		});		
	}
	else{
		logger.error(`AvgValueData insert - No Batch detected - ${req.originalUrl} - ${req.method} - ${req.ip}`);
		res.status(500).json({"function":"AvgValueData insert","error":"No Batch detected"});
	}

};

//Name        : insert
//In          : press record in json format, post in body with batch as key
//Out         : If all records are valid according to model specification, records will be save 
//Description :
exports.updateavgvalue = function(req,res){
		let s=req.query.symbol
		let lastprice=0;
		let avgdata={};
		let holding=null;
		if(typeof s !="undefined"){
			let hrstart=process.hrtime();
			logger.info(`AvgValueData updateavgvalue for Symbol : ${s} START , Time :${new Date()}`);
			// Get all necessary data for calculation
			getdata(req,res,s).then((a)=>{
				lastprice=a[0];
				avgdata=a[1];
				holding=a[2];
				if(Object.keys(holding).length > 0){
					let updatecount=0;let newcount=0;let updateerrorcount=0;let inserterrorcount=0;let errorlist=[];let updatelist=[];let newlist=[];let newrecord=[];
					logger.info(`AvgValueData updateavgvalue for Symbol : ${s} Processing holding list, list szie :${Object.keys(holding).length}, Time :${new Date()}`);
					let hrprocess=process.hrtime();
					// Assume holding is the universal set of address
					(async function(){
					for(var key in holding){
						if(typeof avgdata[key] != "undefined"){
							//existing address , update 
							let deltaqty = avgdata[key]["QTY"]["$numberDecimal"]*1-holding[key]*1
							let updateavgvalue=avgdata[key]["CURRENTAVGVALUE"]["$numberDecimal"]
							logger.debug(`-- 4a. updateavgvalue s: ${s} a: ${key} deltaqty=${deltaqty}`);
							if(deltaqty>0){
								let g=(avgdata[key]["CURRENTAVGVALUE"]["$numberDecimal"]*1*avgdata[key]["QTY"]*1);
								let f=(deltaqty*lastprice);
								logger.debug(`-- 4a. updateavgvalue s: ${s} a: ${key} g=${g} f=${f}`);
								updateavgvalue=(g+f)/holding[key]*1;
							}
							await avgvaluedata.update({"HOLDERADDRESS":key,"SYMBOL":s},{"CURRENTAVGVALUE":updateavgvalue*1,"PRICE":lastprice*1,"QTY":holding[key]*1},{runValidator:true},function(err,docs){
					if(err){
						logger.error(`-- 4a. updateavgvalue s:${s} -a:${key} - Update AvgValue Error - ${error}`);
						updateerrorcount++;
						errorlist.push(key);
					}else{
						logger.info(`-- 4a. updateavgvalue s:${s} -a:${key} - Update AvgValue Success - ${updateavgvalue}`);
						updatecount++;
						updatelist.push(key);
					}
				});//update statement end
							delete avgdata[key];
						}else{
							//new holder , prepare new record
							logger.info(`-- 4b. updateavgvalue s:${s} -a:${key} - New AvgValue Record `);
							newrecord.push({"HOLDERADDRESS":key,"SYMBOL":s,"MANUAL":false,"PRICE":lastprice*1,"QTY":holding[key],"CURRENTAVGVALUE":lastprice*1});
							newcount++;
							newlist.push(key);
							delete avgdata[key];
						}
					} 
					//insert new record
					let hrprocessend = process.hrtime(hrprocess);
					let hrinsert =process.hrtime();
					logger.info(`-- 5. AvgValueData updateavgvalue() - inserting New Record `);
					await avgvaluedata.insertMany(newrecord,function(err,docs){
					if(err){
						logger.error(`-- 5. AvgValueData updateavgvalue() - insert NewRecord error :${err}`);
						logger.debug(`-- 5. New Records: ${JSON.stringify(newrecord)}`);
						inserterrorcount+=newlist.length;
						errorlist.push(newrecord);
						newlist=[];
					}
					else{
						logger.info(`-- 5. AvgValueData updateavgvalue() - insert NewRecord Success`);
					}
					});
					let hrinsertend =process.hrtime(hrinsert);
					//Preparing update result
					let remain = Object.keys(avgdata).length; let ss="Success";
					logger.info(`-- 6. AvgValueData updateavgvalue() new:${newcount} update:${updatecount} error:${updateerrorcount+inserterrorcount} remain(avgdata):${remain}`);
					if(remain>0){
						logger.error(`-- 6. AvgValueData updateavgvalue() Strange avgdata is not fully consumed, remain :${remain}`);
					}	
					logger.info(`AvgValueData updateavgvalue for Symbol : ${s} End Time :${new Date()}`);
					let hrend =process.hrtime(hrstart);
					logger.info(`AvgValueData updateavgvalue for Symbol :${s}, 
								hrtime  Total :${hrend[0]} ${hrend[1]/1000000},
								Processlist : ${hrprocessend[0]} ${hrprocessend[1]/1000000},
								insert : ${hrinsertend[0]} ${hrinsertend[1]/1000000}`);
					if(updateerrorcount>0||remain>0||inserterrorcount>0){ss="Error";}
					res.status(200).json({"function":"AvgValueData updateavgvalue()","status":ss,"update":updatelist,"newlist":newlist,"avgdata":avgdata,
										"error":errorlist});
					logger.info(`AvgValueData updateavgvalue for Symbol : ${s} END `);
					})();// end async
	
				}else{
					logger.error(`AvgValueData updateavgvalue() holding list is empty - ${Object.keys(holding).length}`);
					res.status(500).json({"function":"AvgValueData updateavgvalue()","error":"holding list is empty"});
				}
			});// getdata then end
		}
		else{
			// Missing Para Symbol
			logger.error(`AvgValueData updateavgvalue() Symbol is not supplied - ${req.originalUrl} - ${req.method} - ${req.ip}`);
			res.status(500).json({"function":"AvgValueData updateavgvalue()","error":"mising parameter symbol"});
		}
}

//Name        : 
//In   		  :
//Out         :
//Description :
exports.getavgvaluechange = function(req,res){
		let a=req.body.address;
		let s=req.body.symbol;
		let result=[];
		if(typeof s != "undefined" && typeof a !="undefined"){
			if( s != "" && s != null && a !="" && a != null){
				avgvaluedata.find({SYMBOL:s,HOLDERADDRESS:{$in:a}},null,{sort:{updatedAt:-1}},function(err,docs){
						if(err){
								logger.error(`AvgValueData getavgvaluechange(symbol,address) -S:=${s}, address:=${a} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
								res.status(500).send(err);
						}else{
								logger.info(`AvgValueData getavgvaluechange(symbol,address) -S:=${s}, address:=${a} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
								for(var i=0;i<docs.length;i++){
									let obj = JSON.parse(JSON.stringify(docs[i]));
									logger.debug(`AvgValueData getavgvaluechange(symbol,address) -S:=${s}, address:=${obj.HOLDERADDRESS} - Price:=${obj.PRICE['$numberDecimal']}`);
									logger.debug(`AvgValueData getavgvaluechange(symbol,address) -S:=${s}, address:=${obj.HOLDERADDRESS} - CurrentAvg:=${obj.CURRENTAVGVALUE['$numberDecimal']}`);
									let change=(obj.PRICE['$numberDecimal']*1-obj.CURRENTAVGVALUE['$numberDecimal']*1);
									let percentage=((change/obj.CURRENTAVGVALUE['$numberDecimal']*1)*100)
									logger.info(`AvgValueData getavgvaluechange(symbol,address) -S:=${s}, address:=${obj.HOLDERADDRESS} - change:=${change}`);
									result.push({"address":obj.HOLDERADDRESS,"changepercent":percentage,"qty":obj.QTY});
								}
						res.status(200).json(result);	
						}
				});//end of find 
			}else{
				logger.error(`AvgValueData getavgvaluedatachange(symbol,address) -S:=${s}, address:=${a} Empty String is Found - ${req.originalUrl} - ${req.method} - ${req.ip}`);
				res.status(500).json({"function":"AvgValueData getavgvaluedatachange","error":"Symbol or Address is emptry string"});
			}
		}else{
			// Para symbol or address missing
			logger.error(`AvgValueData getavgvaluechange Symbol or address is not supplied - ${req.originalUrl} - ${req.method} - ${req.ip}`);
			res.status(500).json({"function":"AvgValueData getavgvaluedatachange","error":"mising parameter symbol,address"});
		}


};


//Name        : 
//In   		  :
//Out         :
//Description :
exports.getavgvaluedata = function(req,res){
		let a=req.query.address;
		let s=req.query.symbol;
		let r={};
		if(typeof s != "undefined"){
			if(typeof a !="undefined"){
				//query case supply with symbol and address 
				if(s != "" && s!=null && a!="" && a!=null){
				avgvaluedata.find({SYMBOL:s,HOLDERADDRESS:a},null,{sort:{updatedAt:-1}},function(err,docs){
						if(err){
								logger.error(`AvgValueData getavgvaluedata(symbol,address) -S:=${s},address:=${a} ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
								res.status(500).send(err);
						}else{
								logger.info(`AvgValueData getavgvaluedata(symbol,address) -S:=${s},address:=${a} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
								res.send(docs);
						}});
						
				}else{
					//Empty String of symbol or address 
								logger.error(`AvgValueData getavgvaluedata(symbol,address) -S:=${s},address:=${a} Empty String is Found - ${req.originalUrl} - ${req.method} - ${req.ip}`);
								res.status(500).json({"function":"AvgValueData getavgvaluedata","error":"Symbol or Address is emptry string"});
					
				}
			}else{
				//query case supply with symbol
				if(s != "" && s!=null){
				avgvaluedata.find({SYMBOL:s},null,{sort:{createdAt:-1}},function(err,docs){			
						if(err){
								logger.error(`AvgValueData getavgvaluedata(symbol) -S:=${s}, ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
		 						res.status(500).send(err);
						}else{
		 						logger.info(`AvgValueData getavgvaluedata(symbol) -S:=${s} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
								var obj={};
								for(var i=0;i<docs.length;i++){
									r[docs[i].HOLDERADDRESS]=docs[i];
								}
								res.json(r);
		 				}
				});
				}else{
					// Empty String of Symbol
					logger.error(`AvgValueData getavgvaluedata(symbol) -S:=${s}, Empty String is Found - ${req.originalUrl} - ${req.method} - ${req.ip}`);
		 			res.status(500).json({"function":"AvgValueData getavgvaluedata","error":"Symbol or Address is emptry string"});
			
		 		}
		 	}
		}else{
			logger.error(`AvgValueData getavgvaluedata Symbol is not supplied - ${req.originalUrl} - ${req.method} - ${req.ip}`);
		 	res.status(500).json({"function":"AvgValueData getavgvaluedata","error":"mising parameter symbol or symbol,address"});
		 }
};


