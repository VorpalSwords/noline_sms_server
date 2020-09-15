const firebase = require('firebase');

const firebaseConfig = {
    apiKey: "AIzaSyAweJhqmS_SH2L192pSleuv29mn5oYLlPs",
    authDomain: "no-line-db.firebaseapp.com",
    databaseURL: "https://no-line-db.firebaseio.com",
    projectId: "no-line-db",
    storageBucket: "no-line-db.appspot.com",
    messagingSenderId: "867753962237",
    appId: "1:867753962237:web:7c15df6948a8dccf9a6c94",
    measurementId: "G-LEP4S075FT"
};

const PLACE_TO_SEND_NOTIICATION = 5;

var watchers = [];
var database;

const SetDatabase = (db) => {
    if (!db) {
        console.log("Set Database Error: Empty DB");
    }
    database = db;
}

const LoadFirstWatchers = async (nolineLink) => {
    try {
        let querySnapshot = await database.collection("smsWatchers").get();
        if (!querySnapshot) {
            console.log("Load First Watchers Error: Failed getting SMS Watchers Collection");
        }

        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            NewSmsWatcher(doc.data(), nolineLink + "/#/in-line/?id=" + doc.data().lineId);
        });
    } catch (error) {
        console.log("Load First Watchers Error: ", error);
    }
};

const NewSmsWatcher = async (value, nolineLink) => {
    if (!value) {
        console.log("New SMS Watcher Error: Empty Value");
    }

    let watcher = null;

    try {
        let doc = await database.collection(value.lineId).doc(value.userId).get();
        if (!doc || !doc.exists) {
            console.log("New SMS Watcher Error: No user: " + value.userId + " in line: " + value.lineId, doc);
            return null;
        }
        watcher = {
            lineId : value.lineId,
            userId : value.userId,
            phoneNumber : value.phoneNumber,
            placeInLine : doc.data().placeInLine,
            notifiedToNearby : false,
        };
        let watcherToPush = watcher;
        watchers.push(watcherToPush);
        
        watcher.text = "Welcome to line number '" + watcher.lineId + "'";

        let placeForUser = watcher.placeInLine;

        try {
            let line_data = await database.collection(watcher.lineId).doc("line_data").get();
            if (!line_data || !line_data.exists) {
                console.log("New SMS Watcher Error: No line data in line: " + watcher.lineId);
                return null;
            } else {
                const linePlace = line_data.data().currentPlaceInLine;

                if (watcher.placeInLine < linePlace) {
                    console.log("New SMS Watcher Warning: watcher with lid " + watcher.lineId + " uid " + watcher.userId + " is old one!");
                    return null;
                } else {
                    placeForUser = watcher.placeInLine - linePlace;

                    watcher.text += " and your place is #" + placeForUser + ".";

                    if (placeForUser <= PLACE_TO_SEND_NOTIICATION) {
                        watcher.text += " Please get ready and wait nearby!";
                    }
                }
            }
        } catch (error) {
            console.log("New SMS Watcher Error: Failed getting line data: ", error);
            return null;
        }

        watcher.text += " You can follow your status here: " + nolineLink + "/#/in-line/?id=" + watcher.lineId;
    } catch (error) {
        console.log("New SMS Watcher Error: Error getting user: ", error);
        return null;
    }

    return watcher;
};

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
}

var watchersToNotify = [];

const UpdateWatchers = async () => {
    watchersToNotify = [];
    var watchersTemp = [...watchers];
    watchers = [];

    const start = async () => {
        await asyncForEach(watchersTemp, async(value) => {
            try {
                let line_data = await database.collection(value.lineId).doc("line_data").get();
                if (!line_data || !line_data.exists) {
                    console.log("Update Watchers Error: No line data in line: " + value.lineId);
                } else {
                    const linePlace = line_data.data().currentPlaceInLine;
                    var notify = {
                        phoneNumber : value.phoneNumber,
                        text : ""
                    };

                    if (value.placeInLine < linePlace) {
                        console.log("Update Watchers Warning: watcher with lid " + value.lineId + " uid " + value.userId + " is old one!");

                    } else if (value.placeInLine === linePlace) {
                        console.log("Document data for new first in line:", value.userId, value.placeInLine);
                        notify.text = "Hello kind sir, your turn has come! (line " + value.lineId + ") Thank you for waiting :).";
                        watchersToNotify.push(notify);

                    } else {
                        if (value.placeInLine <= linePlace + PLACE_TO_SEND_NOTIICATION && !value.notifiedToNearby) {
                            console.log("Document data for new fifth in line:", value.userId, value.placeInLine);
                            let num = value.placeInLine - linePlace;
                            notify.text = "You are #" + num + " in line (" + value.lineId + ")! Please get ready and wait nearby!";
                            
                            watchersToNotify.push(notify);
                            value.notifiedToNearby = true;
                        }
                        watchers.push(value);
                    }
                }
            } catch (error) {
                console.log("Update Watchers Error: Error getting document: ", error);
            }
        });
        return watchersToNotify;
    };
    return await start();
};

exports.firebaseConfig = firebaseConfig;
exports.SetDatabase = SetDatabase;
exports.LoadFirstWatchers = LoadFirstWatchers;
exports.NewSmsWatcher = NewSmsWatcher;
exports.UpdateWatchers = UpdateWatchers;

