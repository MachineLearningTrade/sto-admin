// Libaray declare
const Indexer = require('./reorgs-indexer');
const express = require('express')
const _ = require('lodash');
const level = require('level');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const request = require('request');
const logger = require('./lib/logger');
const morgan = require('morgan');

// Variable declare
const API_TOKEN = 'b88eb77da3684106ab053f708cbde64f';
const PORT = 5000;
const PROVIDER = 'https://mainnet.infura.io/v3/' + API_TOKEN;
const DEBUG = false;
const BATCH_SIZE = 100000;
const uri = "mongodb+srv://trgordonb:ensemble@cluster0-lvdi2.azure.mongodb.net/tokenadmin?retryWrites=true&w=majority";

// Initial DB Connection
let mongoDB = process.env.MONGODB_URI || uri;
mongoose.connect(mongoDB,{useNewUrlParser: true});
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('err',err=>logger.error('MongoDB Connection Fail :',err));

//Router Declare
const bodyParser = require('body-parser');
const tradedata = require('./routes/tradedata.route');
const pressdata = require('./routes/pressdata.route');
const milestonedata = require('./routes/milestonedata.route');
const videodata = require('./routes/videodata.route');
const tokensinfodata = require('./routes/tokensinfo.route');
const tokendymaindata = require('./routes/tokendymanic.route');



//app setting
const app = express();
app.use(cors());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(morgan('combined', { stream: logger.stream }));

app.use(express.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//Router mapping 
app.use('/tradedata',tradedata);
app.use('/pressdata',pressdata);
app.use('/milestonedata',milestonedata);
app.use('/videodata',videodata);
app.use('/tokensinfo',tokensinfodata);
app.use('/tokendymanic',tokendymaindata);

app.indexerlist = {}; // for sharing with TokenDymanicData
app.configs = {};
app.dymanic = {};

// Initialize configs with getTokensinfo and indexerlist
logger.info("[APP] Initial configs - TokensInfo and indexerlist")
request.post(
	'http://127.0.0.1:5000/tokensinfo/getTokensinfo',
	{},
	function(error,response,body){
		if(!error && response.statusCode==200){
			 let data = JSON.parse(body);
			 for(var i=0;i<data.length;i++){
                app.configs[data[i].SYMBOL] = {
                      'ADDRESS': data[i].ADDRESS,
                      'START_BLOCK': data[i].START_BLOCK,
                      'DECIMAL': data[i].DECIMAL,
                      'TOTAL_SUPPLY': data[i].TOTAL_SUPPLY,
                      'MEMBERS': data[i].MEMBERS,
                      'TIMEZONE': data[i].TIMEZONE,
                      'MARKTIME': data[i].MARKTIME,
                      'HISTORY_COUNT': data[i].HISTORY_COUNT
				}
    			const indexer = new Indexer({ 
 				address: data[i].ADDRESS, 
  				startBlock: data[i].START_BLOCK, 
   				provider: PROVIDER, 
   				debug: DEBUG,
   				batchSize: BATCH_SIZE
    			});
    			app.indexerlist[data[i].SYMBOL] = indexer;
    			app.indexerlist[data[i].SYMBOL].start();
			 }
		}else{
		}
	}
);
logger.info("[APP] Initial dynamic");
//Initialize dymanic with gettokendymaindata 
request.post(
	'http://127.0.0.1:5000/tokendymanic/gettokendymanicdata',
	{},
	function(error,response,body){
		if(!error && response.statusCode==200){
			 let data = JSON.parse(body);
			 for(var i=0;i<data.length;i++){
          		app.dymanic[data[i].SYMBOL] = {
            	'PRICE_HISTORY': data[i].PRICE_HISTORY,
            	'BALANCE_HISTORY': data[i].BALANCE_HISTORY,
				 }
			 }
		}else{
		}
	}
);

module.exports = app;

app.listen(process.env.PORT||5000,console.log('5000'));



