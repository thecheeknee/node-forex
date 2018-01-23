var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require('body-parser');

var app = express();
var port = 8080;

app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
 
app.listen(port, () => {
  console.log("Server listening on port " + port);
});

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/node-forexdb");

var forexSchema = new mongoose.Schema({
    amount:Number,
    converted:Number,
    date:String,
    fromType:String,
    rate:Number,
    status:Boolean,
    toType:String,
    commision:Number
});

var Transaction = mongoose.model("Transaction", forexSchema);
module.exports = Transaction;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/addTransaction", (req, res) => {
    var myData = new Transaction(req.body);
    
  myData.save()
    .then(item => {
      res.send(JSON.parse('{"status":"success","message":"data saved"}'));
      console.log('data saved');
    })
    .catch(err => {
      res.status(400).send(JSON.parse('{"status":"error","message":"data not saved"}'));
      console.log('data error');
    });
});

app.get("/listTransactions",(req,res) =>{
    Transaction.find({},function(err, data){
        if (err) throw err;
        else{
            //console.log(data);
            var output = [];
            for(var i=0; i< data.length; i++){
                var transact = {
                    amount: data[i].amount,
                    converted: data[i].converted,
                    date: data[i].date,
                    fromType: data[i].fromType,
                    toType:data[i].toType,
                    rate : data[i].rate
                }
                output.push(transact);
            }
            res.send(JSON.parse(JSON.stringify(output)));
        }
        
    });
});

app.get("/sortTransactions",(req,res) =>{
    Transaction.find({},function(err, data){
        if (err) throw err;
        else{
            var output = {
                fromType:[],
                toType:[]
            };
            output.fromType.push(["fromtype","qty"]);
            output.toType.push(["totype","qty"]);
            var fromtypes = {};
            var totypes = {};
            for(var i=0; i< data.length; i++){
                if( fromtypes[ data[i].fromType ]===undefined ){
                    fromtypes[ data[i].fromType ] = 0;
                }
                fromtypes[ data[i].fromType ] = fromtypes[ data[i].fromType ] + 1;
                
                if( totypes[ data[i].toType ]===undefined ){
                    totypes[ data[i].toType ] = 0;
                }
                totypes[ data[i].toType ] = totypes[ data[i].toType ] + 1;
            }
            for( var fromtype in fromtypes){
                output.fromType.push([fromtype,fromtypes[fromtype]]);
                //console.log(typeof(fromtype) + ':' + fromtype + ':' + fromtypes[fromtype]);
            }
            for(var totype in totypes){
                output.toType.push([totype,totypes[totype]]);
            }
            res.send(JSON.parse(JSON.stringify(output)));
        }
    });
});