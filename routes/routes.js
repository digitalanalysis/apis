var appRouter = function(app) {
    app.get("/", function(req, res) {
        res.send("Hello World");
    });

    app.get("/Markets", function(req, res) {
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://john:556493711346794613@127.0.0.1:27017/?authMechanism=DEFAULT&authSource=admin";
        //var url = "mongodb://john:556493711346794613@digitalanalysis.uksouth.cloudapp.azure.com:27017/?authMechanism=DEFAULT&authSource=admin";
        
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("Binance");

          dbo.collection("Kline").findOne({}, function(err, data){
              var test = data;
          })

          dbo.collection("Kline").aggregate([
              {$group:{
                  _id:"$Market"
              }}
          ], function(err, result){
            if (err) throw err;
            var allData = result.toArray (function(err, data){
                output= [];
                for (let index = 0; index < data.length; index++) {
                    output.push(data[index]._id)                    
                }
                return res.send(output);                
                db.close();
            });
          })
        });
    });

    app.get("/MarketDetail", function(req, res) {
        if(!req.query.market) {
            return res.send({"status": "error", "message": "missing market"});
        }
        
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://john:556493711346794613@127.0.0.1:27017/?authMechanism=DEFAULT&authSource=admin";
        //var url = "mongodb://john:556493711346794613@digitalanalysis.uksouth.cloudapp.azure.com:27017/?authMechanism=DEFAULT&authSource=admin";
        
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("Binance");

          dbo.collection("Kline").findOne({}, function(err, data){
              var test = data;
          })

          dbo.collection("Kline").aggregate([
              {
                  $match:{Market:req.query.market}
              },
              {$group:{
                  _id:"$Coin", "Coins":{$sum:1}
              }}
          ], function(err, result){
            if (err) throw err;
            var allData = result.toArray (function(err, data){
                output= {"Market":req.query.market, "Coins":[]};
                for (let index = 0; index < data.length; index++) {
                    output.Coins.push(data[index]._id)
                    //output.push(data[index]._id)  
                }
                return res.send(output);                
                db.close();
            });
          })
        });
    });

    app.get("/CoinDetail", function(req, res) {
        if(!req.query.market) {
            return res.send({"status": "error", "message": "missing market"});
        }
        if(!req.query.coin) {
            return res.send({"status": "error", "message": "missing coin"});
        }
        
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://john:556493711346794613@127.0.0.1:27017/?authMechanism=DEFAULT&authSource=admin";
        //var url = "mongodb://john:556493711346794613@digitalanalysis.uksouth.cloudapp.azure.com:27017/?authMechanism=DEFAULT&authSource=admin";
        
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("Binance");

          dbo.collection("Kline").findOne({}, function(err, data){
              var test = data;
          })

          dbo.collection("Kline").aggregate([
              {
                  $match:{Market:req.query.market, Coin:req.query.coin}
              },
              {$group:{
                  _id:"$Coin",
                  total_points: {$sum:1},
                  volume: {$sum:"$Volume"},
                  min_open: {$min:"$Open"},
                  max_open: {$max:"$Open"},
                  min_low: {$min:"$Low"},
                  max_high: {$max:"$High"},
                  avg_open: {$avg:"$Open"}  
                }}
          ], function(err, result){
            if (err) throw err;
            var allData = result.toArray (function(err, data){
                output= {"Market":req.query.market, "Coins":[]};
                for (let index = 0; index < data.length; index++) {
                    return res.send(data[index]);                
                    db.close();
                }
            });
          })
        });
    });
    app.get("/LastData", function(req, res) {
        if(!req.query.market) {
            return res.send({"status": "error", "message": "missing market"});
        }
        if(!req.query.coin) {
            return res.send({"status": "error", "message": "missing coin"});
        }
        
        var MongoClient = require('mongodb').MongoClient;
        var url = "mongodb://john:556493711346794613@127.0.0.1:27017/?authMechanism=DEFAULT&authSource=admin";
        //var url = "mongodb://john:556493711346794613@digitalanalysis.uksouth.cloudapp.azure.com:27017/?authMechanism=DEFAULT&authSource=admin";
        
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var dbo = db.db("Binance");

        var aggQuery =  [          
        {
            $match:{Market:req.query.market, Coin:req.query.coin}
        },
        {
            $sort:{CloseTime:-1}
        },
        {
            $limit:5
        }
        ];

        if(req.query.limit) {
            aggQuery[2].$limit = parseInt(req.query.limit);
        }

        dbo.collection("Kline").aggregate(aggQuery, function(err, result){
            if (err) throw err;
            var allData = result.toArray (function(err, data){
                return res.send(data);                
                db.close();
            });
          })

    });
});

}
 
module.exports = appRouter;