const firebase = require('firebase');

const firebaseConfig = {
    apiKey: "AIzaSyC8qwCckktJg7qDCQYD4b4TeHQ_V-SUipI",
    authDomain: "noline-dbc7f.firebaseapp.com",
    databaseURL: "https://noline-dbc7f.firebaseio.com",
    projectId: "noline-dbc7f",
    storageBucket: "noline-dbc7f.appspot.com",
    messagingSenderId: "620736713564",
    appId: "1:620736713564:web:de40798b66ffaae2b1e799",
    measurementId: "G-12TW1W9YL4"
};

const PLACE_TO_SEND_NOTIICATION = 5;

var watchers = [];
var database;

const SetDatabase = (db) => {
    if (!db) {
        console.log("Load Watchers Error: Empty DB");
    }
    database = db;
}

const LoadFirstWatchers = async () => {
    try {
        let querySnapshot = await database.collection("smsWatchers").get();
        if (!querySnapshot) {
            console.log("Load Watchers Error: Failed getting SMS Watchers Collection");
        }

        querySnapshot.forEach(function(doc) {
            console.log(doc.id, " => ", doc.data());
            NewSmsWatcher(doc.data());
        });
    } catch (error) {
        console.log("Error getting SMS Watchers Collection:", error);
    }
};

const NewSmsWatcher = async (value) => {
    if (!value) {
        console.log("New SMS Watcher Error: Empty Value");
    }

    let watcher = null;

    try {
        let doc = await database.collection(value.lineId).doc(value.userId).get();
        if (!doc || !doc.exists) {
            console.log("No user: " + value.userId + " in line: " + value.lineId, doc);
            return null;
        }
        console.log("New Watcher Document:", doc.id, doc.data().placeInLine);
        watcher = {
            lineId : value.lineId,
            userId : value.userId,
            phoneNumber : value.phoneNumber,
            placeInLine : doc.data().placeInLine,
            notifiedToNearby : false,
        };
        watchers.push(watcher);

        watcher.text = "Welcome to line number " + watcher.lineId + ", your user id is: " + watcher.userId + " and your current place is " + watcher.placeInLine;
    } catch (error) {
        console.log("Error getting document:", error);
    }

    return watcher;
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

var watchersToNotify = [];

const UpdateWatchers = () => {
    watchersToNotify = [];
    var watchersTemp = [...watchers];
    watchers = [];

    const start = async () => {
        await asyncForEach(watchersTemp, async(value) => {
        try {
            let line_data = await database.collection(value.lineId).doc("line_data").get();
            if (!line_data || !line_data.exists) {
                console.log("No line data in line: " + value.lineId);
            } else {
                const linePlace = line_data.data().currentPlaceInLine;
                var notify = {
                    phoneNumber : value.phoneNumber,
                    text : ""
                };

                if (value.placeInLine < linePlace) {
                    console.log("Warning, watcher with lid " + value.lineId + " uid " + value.userId + " is old one!");
                }
                else if (value.placeInLine == linePlace) {
                    console.log("Document data for new first in line:", value.userId, value.placeInLine);
                    notify.text = "You are first in line! Your time has come!"
                    watchersToNotify.push(notify);
                }
                else {
                    if (value.placeInLine <= linePlace + PLACE_TO_SEND_NOTIICATION && !value.notifiedToNearby) {
                        console.log("Document data for new fifth in line:", value.userId, value.placeInLine);
                        let num = linePlace - value.placeInLine + 1;
                        notify.text = "You are #" + num + " in line! Please get ready and wait nearby!";
                        
                        watchersToNotify.push(notify);
                        console.log("bbb", notify, watchersToNotify);
                        value.notifiedToNearby = true;
                    }
                    watchers.push(value);
                }
            }
        } catch (error) {
            console.log("Error getting document for update:", error);
        }
        });
    };
    start();
    console.log("aaa", watchersToNotify);

    return watchersToNotify;
};

exports.firebaseConfig = firebaseConfig;
exports.SetDatabase = SetDatabase;
exports.LoadFirstWatchers = LoadFirstWatchers;
exports.NewSmsWatcher = NewSmsWatcher;
exports.UpdateWatchers = UpdateWatchers;

