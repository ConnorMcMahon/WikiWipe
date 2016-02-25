var http = require('http');
var express = require('express');
var assert = require('assert');
var bodyParser = require('body-parser');
var ObjectID = require('mongodb').ObjectID;

var app = express();


var router = express.Router();

var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/answerbox';

//Allows app to parse post body request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var addLog = function(db, messageInfo, callback) {
    db.collection('sessions').update(
        { "userID": messageInfo.userID,
          "sessionID": messageInfo.sessionID
        },
        {
            userID: messageInfo.userID,
            sessionID: messageInfo.sessionID,
            logs: messageInfo.logEntries
        },
        //adds new document if doesn't meet conditions
        {upsert: true}
    );
    callback();
}

var getSessions = function(db, callback) {
    db.collection('sessions').find().toArray(function(err, docs){
        if (err) {
            console.log(err);
        } else {
            callback(docs);
        }
    });
};

var getUserLatestSession = function(db, id, callback) {
    var cursor = db.collection('sessions')
        .find({"userID": id})
        .sort({"sessionID": -1})
        .limit(1);
    cursor.nextObject(function(err, doc){
        if (err) {
            console.log(err);
        } else {
            callback(doc);
            return;
        }
    });
};



router.get('/test', function(req, resp) {
    console.log("Hello World");
});

router.post('/addLog', function(req, resp) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connect correctly to server.");
        addLog(db, req.body, function() {
            db.close();
            resp.send("Added");
        });
    });
});

router.get('/getLatestSession', function(req, resp) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connect correctly to server.");
        getUserLatestSession(db, req.query.id, function(doc) {
            db.close();
            resp.send(doc);
        });
    });
});

router.get('/getSessions', function(req, resp) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connect correctly to server.");
        getSessions(db, function(docs) {
            db.close();
            resp.send(docs);
        });
    });
});

app.use('', router)

var server = app.listen(8080, function() {
    console.log(server.address());
    var host = server.address().address;
    var port = server.address().port;
    console.log("Listening at http://%s:%s", host, port);
})