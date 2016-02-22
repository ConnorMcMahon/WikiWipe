var http = require('http');
var express = require('express');
var assert = require('assert');
var bodyParser = require('body-parser');

var app = express();


var router = express.Router();

var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/answerbox';

//Allows app to parse post body request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var addAnswerBox = function(db, message_info, callback) {
    db.collection('answers').insert(
        {
            "query": message_info.query,
            "answerHTML": message_info.answerBox
        }, function(err, docsInserted) {
            console.log(docsInserted);
            callback();
        }
    );
};

var getAnswerBoxes = function(db, callback) {
    db.collection('answers').find().toArray(function(err, docs){
        if (err) {
            console.log(err);
        } else {
            callback(docs);
        }
    });
};

router.get('/test', function(req, resp) {
    console.log("Hello World");
});

router.post('/storeAnswerBox', function(req, resp) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connect correctly to server.");
        addAnswerBox(db, req.body, function() {
            db.close();
            resp.send("it worked?");
        });
    });
    
});

router.get('/allAnswerBoxes', function(req, resp) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connect correctly to server.");
        getAnswerBoxes(db, function(docs) {
            resp.send(docs)
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
