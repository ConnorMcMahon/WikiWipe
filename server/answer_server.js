var http = require('http');
var express = require('express');
var assert = require('assert');

var app = express();

var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/answerbox';

var addAnswerBox = function(db, message_info, callback) {
    db.collection('answers').insert(
        {
            "query": message_info.query,
            "answerHTML": message_info.answerBox
        }, function(err, docsInserted) {

        }
    );
};

app.get('/test', function(req, resp) {
    console.log("Hello World");
});

app.post('/store', function(req, resp) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        console.log("Connect correctly to server.");
        appendBoard(db, request.body, function() {
            db.close();
        });
    });
    response.send(null);
});

var server = app.listen(8080, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Listening at http://%s:%s", host, port);
})
