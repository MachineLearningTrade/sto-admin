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
const DEBUG = true;
const BATCH_SIZE = 100000;

const uri = "mongodb+srv://trgordonb:ensemble@cluster0-lvdi2.azure.mongodb.net/tokenadmin?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

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
                      'MEMBERS': doc.MEMBERS
                  }
              } else {
                  client.close();
                  resolve(configs);
              }
          })
      });
  });  
}

const app = express();
app.use(cors());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({
    extended: true
}));

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

  app.get('/',(req,res)=>{
    res.render('home.ejs')
  })

  app.get('/balances/:symbol', (_req, res) => {
    var symbol = _req.params.symbol;
    if (indexerlist.hasOwnProperty(symbol)) {
      const decimal_factor = 10 ** (-configs[symbol].DECIMAL);
      var _balances = _.mapValues(indexerlist[symbol].getBalances(), b => b*decimal_factor);
      var orderedBal = _(_balances).toPairs().orderBy([1],['desc']).fromPairs().value();
      res.status(200).send({
        "data": _.mapValues(orderedBal, b => b.toString(10)),
        "supply": configs[symbol].TOTAL_SUPPLY,
        "members": configs[symbol].MEMBERS
      });
    } else {
      res.status(200).send({
        "data": "No symbol found"
      });
    }
  });

  app.listen(process.env.PORT||5000,console.log('5000'));
  
}).catch( err => {
  res.status(200).send({
    "data": err
  })
});



