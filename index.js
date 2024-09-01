require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const ejs = require("ejs");

const authRoute = require("./routes/auth");
const quoteRoute = require("./routes/quote");

const app = express();

app.set("view engine", 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));

console.log(process.env.SECRET);
app.use(passport.initialize());
app.use(passport.session());

const DB_URL = process.env.DB_URL.replace("<password>", process.env.DB_PASSWORD);

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        console.log("Connected to MongoDB");

        const db = mongoose.connection;
        const usersCollection = db.collection('users');

        try {
            await usersCollection.dropIndex({ email: 1 });
            console.log("Index 'email_1' dropped successfully");
        } catch (error) {
            if (error.codeName === 'IndexNotFound') {
                console.log("Index 'email_1' does not exist");
            } else {
                console.error("Error dropping index:", error);
            }
        }

        try {
            await usersCollection.dropIndex('username_1');
            console.log("Index 'username_1' dropped successfully");
        } catch (error) {
            if (error.codeName === 'IndexNotFound') {
                console.log("Index 'username_1' does not exist");
            } else {
                console.error("Error dropping index:", error);
            }
        }
    })
    .catch(error => {
        console.error("Error connecting to MongoDB:", error);
    });

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/submit', (req, res) => {
    res.render('submit');
});

app.use('/', authRoute);
app.use('/', quoteRoute);

app.listen(process.env.PORT, () => {
    console.log('Server on port', process.env.PORT);
});
