# API

The API project follows MVC structure, each collection in DB will result in Model of Mongoose and each model will have associated insert/get api call.Summary as follow :

|Model|PATH|API|METHOD|
|-----|----|---|------|
|tradedatas|/tradedata|||
|||/insert|POST|
|||/getTrade|POST|
|pressdata|/pressdata||
|||/insert|POST|
|||/getPress|POST|
|videodata|/videodata||
|||/insert|POST|
|||/getVideo|POST|
|milestondata|/milestonedata||
|||/insert|POST|
|||/getMilestone|POST|
|tokens-info-data|/tokensinfo||
|||/insert|POST|
|||/getTokensinfo|POST|
|tokens-dynamic-data|/tokendymanic||
|||/insert|POST|
|||/gettokendymanicdata|POST|
|||/getbalances/SYMBOLCODE|GET|

## Details

### /tradedata


 |Name        |< POST > /insert| 
 | ------------ | ------------ |
   |In          | trade record in json format, post in body with batch as key| 
   |Out         | <p>If all records are valid according to model specification, records will be save in DB and original records will be return.</p>If any validation error is occured, error will return and nothing will be save in DB|
   |Description |Insert Trade Data from json format in req body with "batch" as key and list as data , data will be save in A    ll or nothing fashion.Those records will be validate according to Model definition before save in db.It will return error     immediately on the first error encounter|

Sample  of Insert data: 
<pre>
{
    "batch": [
        {
            "tradedatetime": "2020-03-19 13:10:00",
            "tradeprice": "1.3",
            "qty": "2000000",
            "ethtransaction": "https://rinkeby.etherscan.io/tx/0x9383d8c789c34e0108d9c2bef4b36564d6f754c75fd515165c1864d7abc4a9fe",
            "currency": "HKD",
            "insertdatetime": "2020-03-19 16:00:00"
        },	
        {
            "tradedatetime": "2020-03-18 12:10:00",
            "tradeprice": "1.2",
            "ethtransaction": "",
            "qty": "94567.23",
            "currency": "HKD",
            "insertdatetime": "2020-03-18 16:00:00"
        }
    ]
	} </pre>


  |Name        | < POST > /getTrade?days=N</br>Optional: days(integer) |
  | ------------ | ------------ |
  |In          | Null or query with params days  |
  |Out         | <p>(Default) If Null is given as input, it will returns latest 5 trade records</p> <p>If days is given as parameters, it will returns pervious N days trade records including today, thus if any cast error occurs for day, wil continuous with default logic.</p><p>If any error occurs, status 500 will be return with error message</p>
  |Remarks| As mongodb will store date in GMT+0, so it is need to restore the currenct time zone for display| 
   |Description | Get Trade records, it uses tradedatetime field for filtering, by default, it wil return 5 latest trade records and if days param is given, it will get those trade with tradedatetime > today-5 including today. | 

Sample 1: 
http://127.0.0.1:5000/tradedata/getTrade
<pre>
[
    {
        "currecny": "USD",
        "_id": "5e7827ea4c7f7911be4a143a",
        "tradedatetime": "2020-03-20T08:00:00.000Z",
        "tradeprice": {
            "$numberDecimal": "1.55"
        },
        "qty": {
            "$numberDecimal": "2"
        },
        "ethtransaction": "https://rinkeby.etherscan.io/tx/0x9383d8c789c34e0108d9c2bef4b36564d6f754c75fd515165c1864d7abc4a9fe",
        "insertdatetime": "2020-03-20T08:00:00.000Z",
        "__v": 0
    },
    {
        "currecny": "USD",
        "_id": "5e7827ea4c7f7911be4a143b",
        "tradedatetime": "2020-03-19T08:10:00.000Z",
        "tradeprice": {
            "$numberDecimal": "1.8"
        },
        "ethtransaction": "",
        "qty": {
            "$numberDecimal": "1.8"
        },
        "insertdatetime": "2020-03-19T08:00:00.000Z",
        "__v": 0
    },
    {
        "currecny": "USD",
        "_id": "5e782ae14c7f7911be4a143c",
        "tradedatetime": "2020-03-19T05:10:00.000Z",
        "tradeprice": {
            "$numberDecimal": "1.3"
        },
        "qty": {
            "$numberDecimal": "2000000"
        },
        "ethtransaction": "https://rinkeby.etherscan.io/tx/0x9383d8c789c34e0108d9c2bef4b36564d6f754c75fd515165c1864d7abc4a9fe",
        "insertdatetime": "2020-03-19T08:00:00.000Z",
        "__v": 0
    },
    {
        "currecny": "USD",
        "_id": "5e782ae14c7f7911be4a143d",
        "tradedatetime": "2020-03-18T04:10:00.000Z",
        "tradeprice": {
            "$numberDecimal": "1.2"
        },
        "ethtransaction": "",
        "qty": {
            "$numberDecimal": "94567.23"
        },
        "insertdatetime": "2020-03-18T08:00:00.000Z",
        "__v": 0
    }
]
</pre>

Sampe 2 :
http://127.0.0.1:5000/tradedata/getTrade?days=4
<pre>
[
    {
        "currecny": "USD",
        "_id": "5e7827ea4c7f7911be4a143a",
        "tradedatetime": "2020-03-20T08:00:00.000Z",
        "tradeprice": {
            "$numberDecimal": "1.55"
        },
        "qty": {
            "$numberDecimal": "2"
        },
        "ethtransaction": "https://rinkeby.etherscan.io/tx/0x9383d8c789c34e0108d9c2bef4b36564d6f754c75fd515165c1864d7abc4a9fe",
        "insertdatetime": "2020-03-20T08:00:00.000Z",
        "__v": 0
    },
    {
        "currecny": "USD",
        "_id": "5e7827ea4c7f7911be4a143b",
        "tradedatetime": "2020-03-19T08:10:00.000Z",
        "tradeprice": {
            "$numberDecimal": "1.8"
        },
        "ethtransaction": "",
        "qty": {
            "$numberDecimal": "1.8"
        },
        "insertdatetime": "2020-03-19T08:00:00.000Z",
        "__v": 0
    }
]
</pre>

### /pressdata
|Name        | /insert|
|---|---|
  |In          | press record in json format, post in body with batch as key| 
  |Out         | <p>If all records are valid according to model specification, records will be save in DB and original records will be return </p><p> If any validation error is occured, error will return and nothing will be save in DB<p>| 
  |Description |Insert Press Data from json format in req body with "batch" as key and list as data , data will be save in All or nothing fashion.Those records will be validate according to Model definition before save in db.It will return error immediately on the first error encounter|                 

Sample  of Insert data: 
<pre>
{
    "batch": [
        {
            "publishdate": "2020-03-13",
            "title" : "Solving Rubik’s Cube with a Robot Hand",
            "url": "https://openai.com/blog/solving-rubiks-cube",
            "source": "openAI",
            "createdatetime": "2020-03-21 02:00:00"
        },
        {
            "publishdate": "2020-03-14",
            "title" : "Token Projects Prefer AirSwap OTC",
            "url": "https://medium.com/fluidity/token-projects-prefer-airswap-otc-cfa0105bf89a",
            "source": "medium",
            "createdatetime": "2020-03-21 02:00:00"
        },
        {
            "publishdate": "2020-03-20",
            "title" : "Liquidity Mining Launch!",
            "url": "https://hummingbot.io/blog/2020-03-liquidity-mining-launch",
            "source": "hummingbot",
            "createdatetime": "2020-03-21 02:00:00"
        }
    ]
}
</pre>

  |Name        | < POST > /getPress?days=N </br> Optional : days(integer)| 
  |--|--|
  |In          | Null or query with params days  | 
  |Out         | <p>(Default)If Null is given as input, it will returns all records in desc order</p><p> If days is given as parameters, it will returns pervious N days press records including today,thus if any casting error occurs, it will continuous with default logic. </p><p>If any error occurs, status 500 will be return with error message<p>| 
  |Remarks  | As mongodb will store date in GMT+0, so it is need to restore the currenct time zone for display| 
  |Description | Get Press records, it uses publishdate field for filtering, by default, it wil return all  press records an    d if days param is given, it will get those press with publishdate > today-5 including today. | 
  
Sample 1: 
http://127.0.0.1:5000/pressdata/getPress
<pre>
[
    {
        "_id": "5e782b1c4c7f7911be4a1440",
        "publishdate": "2020-03-20T00:00:00.000Z",
        "title": "Liquidity Mining Launch!",
        "url": "https://hummingbot.io/blog/2020-03-liquidity-mining-launch",
        "source": "hummingbot",
        "createdatetime": "2020-03-20T18:00:00.000Z",
        "__v": 0
    },
    {
        "_id": "5e782b1c4c7f7911be4a143f",
        "publishdate": "2020-03-14T00:00:00.000Z",
        "title": "Token Projects Prefer AirSwap OTC",
        "url": "https://medium.com/fluidity/token-projects-prefer-airswap-otc-cfa0105bf89a",
        "source": "medium",
        "createdatetime": "2020-03-20T18:00:00.000Z",
        "__v": 0
    },
    {
        "_id": "5e782b1c4c7f7911be4a143e",
        "publishdate": "2020-03-13T00:00:00.000Z",
        "title": "Solving Rubik’s Cube with a Robot Hand",
        "url": "https://openai.com/blog/solving-rubiks-cube",
        "source": "openAI",
        "createdatetime": "2020-03-20T18:00:00.000Z",
        "__v": 0
    }
]
</pre>

Sampe 2 :
http://127.0.0.1:5000/pressdata/getPress?days=5
<pre>
[
    {
        "_id": "5e782b1c4c7f7911be4a1440",
        "publishdate": "2020-03-20T00:00:00.000Z",
        "title": "Liquidity Mining Launch!",
        "url": "https://hummingbot.io/blog/2020-03-liquidity-mining-launch",
        "source": "hummingbot",
        "createdatetime": "2020-03-20T18:00:00.000Z",
        "__v": 0
    }
]
</pre>


### /videodata
|Name        | /insert|
|---|---|
  |In          | video record in json format, post in body with batch as key| 
  |Out         | <p>If all records are valid according to model specification, records will be save in DB and original records will be return </p><p> If any validation error is occured, error will return and nothing will be save in DB<p>| 
  |Description |Insert video Data from json format in req body with "batch" as key and list as data , data will be save in All or nothing fashion.Those records will be validate according to Model definition before save in db.It will return error immediately on the first error encounter|

Sample  of Insert data: 
<pre>
{
    "batch": [
        {
            "title": "AlphaGo – The Movie | Full Documentary",
            "url": "https://youtu.be/WXuK6gekU1Y",
            "validFrom": "2020-01-01",
            "validTo": "2020-03-18"
        },
        {
        	"title": "DeepMind StarCraft II Demonstration",
            "url": "https://youtu.be/cUTMhmVh1qs",
            "validFrom": "2020-03-19",
            "validTo": "2020-03-20"
        },
        {
			"title": "What is a Quant?",
            "url": "https://youtu.be/lG_OBZocF3E",
            "validFrom": "2020-03-21",
            "validTo": "2020-05-05"
        }
    ]
}
</pre> 
 
 
  |Name        | < POST > /getVideo?days=N </br> Optional : days(integer)| 
  |--|--|
  |In          | Null or query with params days  | 
  |Out         | <p>(Default)If Null is given as input, it will returns all records in desc order</p><p> If days is given as parameters, it will returns pervious N days video records including today,thus if any casting error occurs, it will continuous with default logic. </p><p>If any error occurs, status 500 will be return with error message<p>| 
  |Remarks  | As mongodb will store date in GMT+0, so it is need to restore the currenct time zone for display| 
  |Description | Get Video records, it uses vaildFromfield for filtering, by default, it wil return all  press records and if days param is given, it will get those press with validFrom > today-5 including today. | 
  
Sample 1: 
http://127.0.0.1:5000/videodata/getvideo
<pre>
[
    {
        "_id": "5e782b4d4c7f7911be4a1446",
        "title": "AlphaGo – The Movie | Full Documentary",
        "url": "https://youtu.be/WXuK6gekU1Y",
        "validFrom": "2020-01-01T00:00:00.000Z",
        "validTo": "2020-03-18T00:00:00.000Z",
        "__v": 0
    },
    {
        "_id": "5e782b4d4c7f7911be4a1447",
        "title": "DeepMind StarCraft II Demonstration",
        "url": "https://youtu.be/cUTMhmVh1qs",
        "validFrom": "2020-03-19T00:00:00.000Z",
        "validTo": "2020-03-20T00:00:00.000Z",
        "__v": 0
    },
    {
        "_id": "5e782b4d4c7f7911be4a1448",
        "title": "What is a Quant?",
        "url": "https://youtu.be/lG_OBZocF3E",
        "validFrom": "2020-03-21T00:00:00.000Z",
        "validTo": "2020-05-05T00:00:00.000Z",
        "__v": 0
    }
]
</pre>

Sampe 2 :
http://127.0.0.1:5000/videodata/getvideo?days=5
<pre>
[
    {
        "_id": "5e782b4d4c7f7911be4a1447",
        "title": "DeepMind StarCraft II Demonstration",
        "url": "https://youtu.be/cUTMhmVh1qs",
        "validFrom": "2020-03-19T00:00:00.000Z",
        "validTo": "2020-03-20T00:00:00.000Z",
        "__v": 0
    },
    {
        "_id": "5e782b4d4c7f7911be4a1448",
        "title": "What is a Quant?",
        "url": "https://youtu.be/lG_OBZocF3E",
        "validFrom": "2020-03-21T00:00:00.000Z",
        "validTo": "2020-05-05T00:00:00.000Z",
        "__v": 0
    }
]
</pre>
### /milestonedata
|Name        | /insert|
|---|---|
  |In          | milestone record in json format, post in body with batch as key| 
  |Out         | <p>If all records are valid according to model specification, records will be save in DB and original records will be return </p><p> If any validation error is occured, error will return and nothing will be save in DB<p>| 
  |Description |Insert MileStoneData from json format in req body with "batch" as key and list as data , data will be save in All or nothing fashion.Those records will be validate according to Model definition before save in db.It will return error immediately on the first error encounter|

Sample  of Insert data: 
<pre>
{
    "batch": [
        {
            "date": "2019-05-11",
            "desc": "Project start",
            "exturl": "https://blog.coinmarketcap.com/2020/01/06/view-from-the-capital-tokenizing-hashpower",
            "isvideo": "false"
        },
        {
            "date": "2019-06-11",
            "desc": "Stage 1",
            "exturl": "https://blog.coinmarketcap.com/2020/03/18/defi-on-bitcoin-the-time-has-come-for-decentralized-finance-to-run-on-top-of-bitcoins-network",
            "isvideo": "false"
        },
        {
            "date": "2019-09-14",
            "desc": "Stage 2",
            "exturl": "https://medium.com/fluidity/ethereum-infrastructure-grows-up-91ab3ca37109",
            "isvideo": "false"
        },
        {
            "date": "2020-01-04",
            "desc": "Stage 3",
            "exturl": "https://youtu.be/EaiAVy2Kb2g",
            "isvideo": "true"
        },
        { 
            "date": "2020-03-17",
            "desc": "Stage 4",
            "exturl": "https://blog.coinmarketcap.com/2020/03/04/coinmarketcap-now-lists-crypto-derivative-markets/",
            "isvideo": "false"
        }
    ]
}
</pre> 

  |Name        | < POST > /getMilestone?days=N </br> Optional : days(integer)| 
  |--|--|
  |In          | Null or query with params days  | 
  |Out         | <p>(Default)If Null is given as input, it will returns all records in desc order</p><p> If days is given as parameters, it will returns pervious N days milestone records including today,thus if any casting error occurs, it will continuous with default logic. </p><p>If any error occurs, status 500 will be return with error message<p>| 
  |Remarks  | As mongodb will store date in GMT+0, so it is need to restore the currenct time zone for display| 
  |Description | Get MileStone records, it uses date field for filtering, by default, it wil return all  press records and if days param is given, it will get those press with date > today-5 including today. | 
  
Sample 1: 
http://127.0.0.1:5000/milestonedata/getmilestone
<pre>
[
    {
        "isvideo": false,
        "_id": "5e782b3f4c7f7911be4a1445",
        "date": "2020-03-17T00:00:00.000Z",
        "desc": "Stage 4",
        "exturl": "https://blog.coinmarketcap.com/2020/03/04/coinmarketcap-now-lists-crypto-derivative-markets/",
        "__v": 0
    },
    {
        "isvideo": true,
        "_id": "5e782b3f4c7f7911be4a1444",
        "date": "2020-01-04T00:00:00.000Z",
        "desc": "Stage 3",
        "exturl": "https://youtu.be/EaiAVy2Kb2g",
        "__v": 0
    },
    {
        "isvideo": false,
        "_id": "5e782b3f4c7f7911be4a1443",
        "date": "2019-09-14T00:00:00.000Z",
        "desc": "Stage 2",
        "exturl": "https://medium.com/fluidity/ethereum-infrastructure-grows-up-91ab3ca37109",
        "__v": 0
    },
    {
        "isvideo": false,
        "_id": "5e782b3f4c7f7911be4a1442",
        "date": "2019-06-11T00:00:00.000Z",
        "desc": "Stage 1",
        "exturl": "https://blog.coinmarketcap.com/2020/03/18/defi-on-bitcoin-the-time-has-come-for-decentralized-finance-to-run-on-top-of-bitcoins-network",
        "__v": 0
    },
    {
        "isvideo": false,
        "_id": "5e782b3f4c7f7911be4a1441",
        "date": "2019-05-11T00:00:00.000Z",
        "desc": "Project start",
        "exturl": "https://blog.coinmarketcap.com/2020/01/06/view-from-the-capital-tokenizing-hashpower",
        "__v": 0
    }
]
</pre>

Sampe 2 :
http://127.0.0.1:5000/milestonedata/getmilestone?days=10
[
    {
        "isvideo": false,
        "_id": "5e782b3f4c7f7911be4a1445",
        "date": "2020-03-17T00:00:00.000Z",
        "desc": "Stage 4",
        "exturl": "https://blog.coinmarketcap.com/2020/03/04/coinmarketcap-now-lists-crypto-derivative-markets/",
        "__v": 0
    }
]
</pre>

### /tokensinfo
|Name        | /insert|
|---|---|
  |In          | token record in json format, post in body with batch as key| 
  |Out         | <p>If all records are valid according to model specification, records will be save in DB and original records will be return </p><p> If any validation error is occured, error will return and nothing will be save in DB<p>| 
  |Description |Insert Tokens-info-Data from json format in req body with "batch" as key and list as data , data will be save in All or nothing fashion.Those records will be validate according to Model definition before save in db.It will return error immediately on the first error encounter|

Sample  of Insert data: 
<pre>

</pre> 

  |Name        | < POST > /getTokensinfo?symbol=String </br> Optional : symbol(String)| 
  |--|--|
  |In          | Null or query with params symbol  | 
  |Out         | <p>(Default)If Null is given as input, it will returns all records in desc order</p><p> If symbols is given as parameters, it will returns the specific record if it exist in the DB,thus if any casting error occurs, it will continuous with default logic. </p><p>If any error occurs, status 500 will be return with error message<p>| 

  |Description | Get Tokens-inf-data records, it uses symbol field for filtering, by default, it wil return all  tokensinfodata records and if symbol param is given, it will return the specific record if find. | 
  
Sample 1: 
http://127.0.0.1:5000/tokensinfo/getTokensinfo
<pre>
[
    {
        "MEMBERS": [],
        "_id": "5e5d3cd6d6a8435f70d1b25b",
        "SYMBOL": "CCT",
        "ADDRESS": "0x3c23dBF412D58F5Af2323bAE71283AD0932223F6",
        "START_BLOCK": "9000000",
        "DECIMAL": 0,
        "TOTAL_SUPPLY": 9282000,
        "TIMEZONE": "America/New_York",
        "MARKTIME": "07:00:00",
        "HISTORY_COUNT": 3
    },
    {
        "MEMBERS": [],
        "_id": "5e5d3cd6d6a8435f70d1b25c",
        "SYMBOL": "SF4E",
        "ADDRESS": "0xAec7d1069e3a914a3EB50f0BFB1796751f2ce48a",
        "START_BLOCK": "5500000",
        "DECIMAL": 18,
        "TOTAL_SUPPLY": 1000000000,
        "TIMEZONE": "America/New_York",
        "MARKTIME": "09:00:00",
        "HISTORY_COUNT": 3
    },
    {
        "MEMBERS": [
            "0xd769010D3813bAFAf4aDdbfe258EAFD07828bB83",
            "0x46705dfff24256421A05D056c29E81Bdc09723B8",
            "0xaB5C66752a9e8167967685F1450532fB96d5d24f"
        ],
        "_id": "5e5d3cd6d6a8435f70d1b25d",
        "SYMBOL": "FTT",
        "ADDRESS": "0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9",
        "START_BLOCK": "7000000",
        "DECIMAL": 18,
        "TOTAL_SUPPLY": 347370548,
        "TIMEZONE": "America/New_York",
        "MARKTIME": "00:00:00",
        "HISTORY_COUNT": 3
    }
]
</pre>

Sampe 2 :
http://127.0.0.1:5000/tokensinfo/getTokensinfo?symbol=FTT
<pre>
[
    {
        "MEMBERS": [
            "0xd769010D3813bAFAf4aDdbfe258EAFD07828bB83",
            "0x46705dfff24256421A05D056c29E81Bdc09723B8",
            "0xaB5C66752a9e8167967685F1450532fB96d5d24f"
        ],
        "_id": "5e5d3cd6d6a8435f70d1b25d",
        "SYMBOL": "FTT",
        "ADDRESS": "0x50d1c9771902476076ecfc8b2a83ad6b9355a4c9",
        "START_BLOCK": "7000000",
        "DECIMAL": 18,
        "TOTAL_SUPPLY": 347370548,
        "TIMEZONE": "America/New_York",
        "MARKTIME": "00:00:00",
        "HISTORY_COUNT": 3
    }
]


</pre>


### /tokendymanic
|Name        | /insert|
|---|---|
  |In          | token dymainc record in json format, post in body with batch as key| 
  |Out         | <p>If all records are valid according to model specification, records will be save in DB and original records will be return </p><p> If any validation error is occured, error will return and nothing will be save in DB<p>| 
  |Description |Insert Tokens-dymanic-data from json format in req body with "batch" as key and list as data , data will be save in All or nothing fashion.Those records will be validate according to Model definition before save in db.It will return error immediately on the first error encounter|

Sample  of Insert data: 
<pre>

</pre> 

  |Name        | < POST > /gettokendymanicdata?symbol=String </br> Optional : symbol(String)| 
  |--|--|
  |In          | Null or query with params symbol  | 
  |Out         | <p>(Default)If Null is given as input, it will returns all records in desc order</p><p> If symbols is given as parameters, it will returns the specific record if it exist in the DB,thus if any casting error occurs, it will continuous with default logic. </p><p>If any error occurs, status 500 will be return with error message<p>| 

  |Description | Get Tokens-dymanic-data records, it uses symbol field for filtering, by default, it wil return all  tokensinfodata records and if symbol param is given, it will return the specific record if find. | 
  
Sample 1: 
http://127.0.0.1:5000/tokendymanic/gettokendymanicdata
<pre>
[
    {
        "PRICE_HISTORY": [
            {
                "$numberDecimal": "0.0321"
            },
            {
                "$numberDecimal": "0.0332"
            },
            {
                "$numberDecimal": "0.0298"
            }
        ],
        "BALANCE_HISTORY": [
            {
                "0xd769010D3813bAFAf4aDdbfe258EAFD07828bB83": [
                    3000000,
                    3000001.2,
                    3000002.4
                ],
                "0x46705dfff24256421A05D056c29E81Bdc09723B8": [
                    2433434.22,
                    2423442.44,
                    2453212.3
                ],
                "0xaB5C66752a9e8167967685F1450532fB96d5d24f": [
                    321213,
                    321213,
                    321213
                ]
            }
        ],
        "_id": "5e74baac1c9d4400001ca3d7",
        "SYMBOL": "FTT"
    }
]
</pre>

Sampe 2 :
http://127.0.0.1:5000/tokendymanic/gettokendymanicdata?symbol=FTT
<pre>
[
    {
        "PRICE_HISTORY": [
            {
                "$numberDecimal": "0.0321"
            },
            {
                "$numberDecimal": "0.0332"
            },
            {
                "$numberDecimal": "0.0298"
            }
        ],
        "BALANCE_HISTORY": [
            {
                "0xd769010D3813bAFAf4aDdbfe258EAFD07828bB83": [
                    3000000,
                    3000001.2,
                    3000002.4
                ],
                "0x46705dfff24256421A05D056c29E81Bdc09723B8": [
                    2433434.22,
                    2423442.44,
                    2453212.3
                ],
                "0xaB5C66752a9e8167967685F1450532fB96d5d24f": [
                    321213,
                    321213,
                    321213
                ]
            }
        ],
        "_id": "5e74baac1c9d4400001ca3d7",
        "SYMBOL": "FTT"
    }
]
</pre>


  |Name        | < GET > /getbalance/{symbol code} </br> Mandatory : symbol code| 
  |--|--|
  |In          | Symbol Code in URL path  | 
  |Out         | <p>It will returns "data","supply" and "member" for the specific symbol record if it exist in the DB </p><p>If any error occurs, status 500 will be return with error message<p>| 

  |Description | Please advise | 
  
Sample 1: 
http://127.0.0.1:5000/tokendymanic/getbalances/FTT

<pre>

{
    "data": {
        "0x5f86Fe0e62D1f0226F535eBe5d98A5d3edC9A615": "7660.6517",
        "0xE93381fB4c4F14bDa253907b18faD305D799241a": "7555.219800000001",
        "0x0681d8Db095565FE8A346fA0277bFfdE9C0eDBBF": "-7555.219800000001",
        "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE": "-7660.6517"
    },
    "supply": 347370548,
    "members": {
        "0xd769010D3813bAFAf4aDdbfe258EAFD07828bB83": "0",
        "0x46705dfff24256421A05D056c29E81Bdc09723B8": "0",
        "0xaB5C66752a9e8167967685F1450532fB96d5d24f": "0"
    }
}
</pre>

# Model

## tradedatas
| FieldName |DataType   |Required |
| ------------ | ------------ | ------------ |
| tradedatetime  | Date   | yes   |
| tradeprice  | Decimal128  | yes   |
| qty  | Decimal128  | yes  |
| ethtransaction  | String  | no  |
| currency  | String  | no ,default : USD  |
| insertdatetime  | Date  | no, default : Date.now  |

## pressdatas
| FieldName |DataType   |Required |
| ------------ | ------------ | ------------ |
| publishdate  | Date   | yes   |
| title | String  | yes   |
| url  | String  | no  |
| source  | String  | no  |
| createdatetime  | Date  | no, default : Date.now  |

## videodatas
| FieldName |DataType   |Required |
| ------------ | ------------ | ------------ |
| title  | String  | yes   |
| url | String  | no   |
| validFrom  | Date  | no  |
| validTo  | Date  | no  |

## milestondatas
| FieldName |DataType   |Required |
| ------------ | ------------ | ------------ |
| date | Date  | yes   |
| desc | Date  | yes   |
| exturl  | String | no  |
| isVideo | boolean  | no, default : False |


## tokens-info-data
| FieldName |DataType   |Required |
| ------------ | ------------ | ------------ |
| SYMBOL | String  | yes , unique=yes  |
| ADDRESS | String  | yes   |
| START_BLOCK | String | no  |
| DECIMAL | Number  | yes |
| TOTAL_SUPPLY | Number  | no |
| MARKTIME | String  | no |
| HISTORY_COUNT | Number  | no |
| MEMBERS | Array of String  | no |

## tokens-dynamic-data
| FieldName |DataType   |Required |
| ------------ | ------------ | ------------ |
| SYMBOL | String  | yes , unique=yes  |
| PRICE_HISTORY| Array of Decimal128  | no |
| BALANCE_HISTORY | Array of Object | no  |
