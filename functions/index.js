const functions = require('firebase-functions');
const express = require('express');
const cors = require("cors");
const admin = require("firebase-admin");
const app = express();
const port = 9999;

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://arpitdemo26-default-rtdb.asia-southeast1.firebasedatabase.app"
});

// Serve Static Assets
app.use(express.static(__dirname + '/static', { dotfiles: 'allow' }));
app.use(express.static('public'));
app.use(cors({ origin: true }));

app.get('/scene', (req, res) => {
    res.render("scene.ejs");
});

app.listen(port, function () {
    console.log("Listening to port " + port);
});

// Google Cloud Build
exports.app = functions.https.onRequest(app);