const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const firebase = require('firebase');

const twilio_api = require('./twilio_api');
const firebase_api = require('./firebase_api');

/* EXPRESS */
const app = express();
app.use(bodyParser.urlencoded({extended: false}));

app.post('/sms', (req, res) => {
    twilio_api.LogReceievedSms(req, res);
});

app.post('/voice', (req, res) => {
    twilio_api.LogIncomingCall(req, res);
});

/* --------------------------------- */

/* FIREBASE */
const firebaseApp = firebase.initializeApp(firebase_api.firebaseConfig);
const database = firebaseApp.firestore();

firebase_api.SetDatabase(database);

database.collection('smsWatchers').onSnapshot(async (querySnapshot) => {
    querySnapshot.docChanges().forEach(async (change) => {
        if (change.type == "added") {
            console.log("SMS Watchers Add! ", change.doc.id, change.doc.data());
            watcher = await firebase_api.NewSmsWatcher(change.doc.data());
            if (watcher) {
                twilio_api.SendSms(watcher.phoneNumber, watcher.text);
            }
        } else if (change.type == "modified") {
            console.log("SMS Watchers Modified");
        } else if (change.type == "removed") {
            console.log("SMS Watchers Removed");
        }
   })
});

setInterval(async () => {
    console.log("Tick");
    watchersToNotify = await firebase_api.UpdateWatchers();
    watchersToNotify.forEach(async (watcher) => { twilio_api.SendSms(watcher.phoneNumber, watcher.text);} );
}, 2000);

/* --------------------------------- */

/* SERVE */
http.createServer(app).listen(1337, () => {
    console.log('Express server listening on port 1337');
});