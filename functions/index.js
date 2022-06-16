const functions = require('firebase-functions');
const express = require('express');
const cors = require("cors");
const admin = require("firebase-admin");
const app = express();
const port = 7777;

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ajnasuite.firebaseio.com"
});



// Serve Static Assets
app.use(express.static(__dirname + '/static', { dotfiles: 'allow' }));
app.use(express.static('public'));
app.use('/three', express.static('public/three'));
app.use(express.static('public/three'));

app.use(cors({ origin: true }));

app.get('/scene', (req, res) => {
    res.render("scene.ejs");
});

app.listen(port, function () {
    console.log("Listening to port " + port);
});


exports.app = functions.https.onRequest(app);