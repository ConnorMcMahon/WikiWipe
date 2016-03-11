var http = require('http');
var express = require('express');
var assert = require('assert');
var bodyParser = require('body-parser');
var cors = require('cors');
var ObjectID = require('mongodb').ObjectID;

var app = express();


var router = express.Router();

var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/answerbox';

//Allows app to parse post body request
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({credentials: true, origin: true}));

app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
          next();
});

var addLog = function(db, collection, messageInfo, callback) {
    console.dir(messageInfo);
    db.collection(collection).update(
        { 
            "userID": messageInfo.userID,
            "sessionID": messageInfo.sessionID
        },
        {
            $push: { logs: messageInfo.log }
        }
    );
    callback();
}

var getSessions = function(db, collection, callback) {
    db.collection(collection).find().toArray(function(err, docs){
        if (err) {
            console.log(err);
        } else {
            callback(docs);
        }
    });
};

var getUserLatestSession = function(db, collection, id, callback) {
    var cursor = db.collection(collection)
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

var getGreatestUserID = function(db, callback) {
    var cursor = db.collection("users")
                   .find()
                   .sort({"userID": -1})
                   .limit(1);
    cursor.nextObject(function(err, doc){
        if(err || !doc) {
            console.log("found no users");
            callback(db, 1);
            return;
        } else {
            callback(db, doc.userID+1);
            return;
        }
    });
}

var addUserID = function(db, id) {
    db.collection("users").insert({
        userID: id,
        timeStamp: Date.now()
    });
}


router.get('/getNewUserID', function(req, resp) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        getGreatestUserID(db, function(db, id) {
            addUserID(db, id);
            db.close();
            resp.send(String(id));
        });
    });
});

router.get('/test', function(req, resp) {
    console.log("Hello World");
});

router.post('/addLog', function(req, resp) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        addLog(db, "search_session", req.body, function() {
            db.close();
            resp.send("Added");
        });
    });
});

router.get('/getLatestSessionID', function(req, resp) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        getUserLatestSession(db, "search_session", req.query.id, function(data) {
            db.close();
            var responseObject = {};
            if(data.logs) {
                var lastSession = data.logs.slice(-1)[0];
                responseObject.lastTimestamp = lastSession.timestamp;
                responseObject.id = lastSession.sessionID;
            }
            resp.send(responseObject);
        });
    });
});

router.get('/getSessions', function(req, resp) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        getSessions(db, "search_session", function(docs) {
            db.close();
            resp.send(docs);
        });
    });
});

router.post('/addWikiLog', function(req, resp) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        addLog(db, "wiki_session", req.body, function() {
            db.close();
            resp.send("Added");
        });
    });
});

router.get('/getLatestWikiSessionID', function(req, resp) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        getUserLatestSession(db, "wiki_session", req.query.id, function(data) {
            db.close();
            if(data.logs) {
                var lastSession = data.logs.slice(-1)[0];
                responseObject.lastTimestamp = lastSession.timestamp;
                responseObject.id = lastSession.sessionID;
            }
            resp.send(responseObject);
        });
    });
});

router.get('/getWikiSessions', function(req, resp) {
    MongoClient.connect(url, function(err, db) {
        assert.equal(null, err);
        getSessions(db, "wiki_session", function(docs) {
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
