const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://trgordonb:ensemble@cluster0-lvdi2.azure.mongodb.net/tokenadmin?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

function getConfigData() {
    client.connect(err => {
        var cursor = client.db("tokenadmin").collection("tokens-info").find();
        cursor.each( (err, doc) => {
            if (err) {
                console.log(err);
            }
            else if (doc != null) {               
                console.log(doc);
            };
        });
    });
};


getConfigData();

/** 
client.connect(err => {
    client.db("tokenadmin").collection("tokens-info").find().forEach( doc => {
        if (doc != null) {
            if (doc['SYMBOL'] == 'SF4E') {
                client.db("tokenadmin").collection("tokens-info").update({'SYMBOL': 'SF4E'}, {$set: {
                    'MEMBERS': []}})
            }
        }
    });
})
*/
