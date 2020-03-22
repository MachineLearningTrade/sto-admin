const Indexer = require('./reorgs-indexer');
const express = require('express')
const _ = require('lodash');
const level = require('level');
const path = require('path');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;

const API_TOKEN = 'b88eb77da3684106ab053f708cbde64f';
const PORT = 5000;
const PROVIDER = 'https://mainnet.infura.io/v3/' + API_TOKEN;
const DEBUG = false;
const BATCH_SIZE = 100000;

const uri = "mongodb+srv://trgordonb:ensemble@cluster0-lvdi2.azure.mongodb.net/tokenadmin?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

//Add by dick start
//2020-03-20

const bodyParser = require('body-parser');
const tradedata = require('./routes/tradedata.route');
const pressdata = require('./routes/pressdata.route');
const milestonedata = require('./routes/milestonedata.route');
const videodata = require('./routes/videodata.route');
const mongoose = require('mongoose');
let dev_db_uri = 'mongodb://stoadmin:ddr65536@127.0.0.1/STOTesting';
let mongoDB = process.env.MONGODB_URI || dev_db_uri;
mongoose.connect(mongoDB,{useNewUrlParser: true});
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('err',console.error.bind(console,'MongoDB Connection Error.'));
//Add by dick end

function getConfigData() {
  return new Promise((resolve, reject) => {
      let configs = {};
      client.connect(err => {
          var cursor = client.db("tokenadmin").collection("tokens-info").find();
          cursor.each( (err, doc) => {
              if (err) {
                  reject(err);
              }
              if (doc != null) {               
                  configs[doc.SYMBOL] = {
                      'ADDRESS': doc.ADDRESS,
                      'START_BLOCK': doc.START_BLOCK,
                      'DECIMAL': doc.DECIMAL,
                      'TOTAL_SUPPLY': doc.TOTAL_SUPPLY,
                      'MEMBERS': doc.MEMBERS,
                      'TIMEZONE': doc.TIMEZONE,
                      'MARKTIME': doc.MARKTIME,
                      'HISTORY_COUNT': doc.HISTORY_COUNT
                  }
              } else {   
                  resolve(configs);           
              }           
          });       
      });
  });  
}

function getDynamicData() {
  return new Promise((resolve, reject) => {
    let data = {};
    client.connect(err => {
      var cursor = client.db("tokenadmin").collection("tokens-dynamic-data").find();
      cursor.each( (err, doc) => {
        if (err) {
          reject(err);
        }
        if (doc != null) {
          data[doc.SYMBOL] = {
            'PRICE_HISTORY': doc.PRICE_HISTORY,
            'BALANCE_HISTORY': doc.BALANCE_HISTORY
          }
        } else {
          client.close();      
          resolve(data);   
        }       
      });     
    })
  });
}

const app = express();
app.use(cors());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use('/tradedata',tradedata);
app.use('/pressdata',pressdata);
app.use('/milestonedata',milestonedata);
app.use('/videodata',videodata);

let indexerlist = {};

getConfigData().then(configs => {
  for (const symbol in configs) {
    const indexer = new Indexer({ 
        address: configs[symbol].ADDRESS, 
        startBlock: configs[symbol].START_BLOCK, 
        provider: PROVIDER, 
        debug: DEBUG,
        batchSize: BATCH_SIZE
    });
    indexerlist[symbol] = indexer;
  }

  for (const symbol in indexerlist) {
    indexerlist[symbol].start();
  }

  getDynamicData().then(data => {

    app.get('/',(req,res)=>{
      res.render('home.ejs')
    })
  
    app.get('/balances/:symbol', (_req, res) => {
      var symbol = _req.params.symbol;
      if (indexerlist.hasOwnProperty(symbol)) {
        const decimal_factor = 10 ** (-configs[symbol].DECIMAL);
        var _balances = _.mapValues(indexerlist[symbol].getBalances(), b => b*decimal_factor);
        var orderedBal = _(_balances).toPairs().orderBy([1],['desc']).fromPairs().value();
        var memberCapChange = {};
        for (var i=0; i < configs[symbol].MEMBERS.length; i++) {
          let member = configs[symbol].MEMBERS[i];
          let historyLength = configs[symbol].HISTORY_COUNT;
          if (historyLength == -1) {
            historyLength = data[symbol].PRICE_HISTORY.length;
          }
          if (data[symbol].BALANCE_HISTORY.hasOwnProperty(member) && data[symbol].BALANCE_HISTORY[member].length == historyLength) {
            let marketCap_start = data[symbol].BALANCE_HISTORY[member][0] * data[symbol].PRICE_HISTORY[0];
            let marketCap_end = data[symbol].BALANCE_HISTORY[member][historyLength-1] * data[symbol].PRICE_HISTORY[historyLength-1];
            let change = parseFloat(100 * (marketCap_end - marketCap_start) / marketCap_start).toFixed(2);
            memberCapChange[member] = change ;
          } else {
            memberCapChange[member] = '0';
          }
        }
        res.status(200).send({
          "data": _.mapValues(orderedBal, b => b.toString(10)),
          "supply": configs[symbol].TOTAL_SUPPLY,
          "members": memberCapChange
        });
      } else {
        res.status(200).send({
          "data": "No symbol found"
        });
      }
    });
  
    app.listen(process.env.PORT||5000,console.log('5000'));

  }).catch( err => {
    console.log(err);
  });
  
}).catch( err => {
  res.status(200).send({
    "data": err
  })
});



