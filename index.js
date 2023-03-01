const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Message = require('./models/Message');
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

const mongoDb = process.env.mongo;
mongoose.set('strictQuery', false);

mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, (email, password, done) => {
    User.findOne({ email: email }).
        then(user => {
            if (!user) {
                console.log("WRONG EMAIL");
                return done(null, false, { message: "Incorrect email" });
            }
            bcrypt.compare(password, user.password)
                .then(res => {
                    if (res) {
                        console.log("Yay", res)
                        return done(null, user);
                    } else {
                        console.log("incorrect pass", res)
                        return done(null, false, { message: "Incorrect password" });
                    }
                })
                .catch(err => {
                    console.log("ERR", err)
                    return done(err);
                })
        })
        .catch(err => {
            console.log("ERROR", err)
            return done(err);
        })
}));


passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id).
        then(user => {
            done(null, user);
        }).
        catch(err => {
            console.log("error", err)
            return done(err);
        })
});

app.use(session({ secret: process.env.secret_key, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.get("/", (req, res) => {
    res.render("index", { user: req.user })
});

app.get("/login", (req, res) => {
    res.render("login")
});

app.get("/sign-up", (req, res) => res.render("sign-up"));

app.post("/sign-up", (req, res, next) => {

    bcrypt.hash(req.body.password, 10)
        .then(hashedPass => {
            const user = new User({
                first: req.body.first,
                last: req.body.last,
                email: req.body.email,
                password: hashedPass
            })
            console.log("PASSWORD SAVED!")
            return user.save();
        })
        .then(() => {
            res.redirect("/");
        })
        .catch(err => {
            next(err);
        });
})

app.post('/log-in', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/',
}));

app.get('/log-out', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

//msg
app.get('/message-form', (req, res) => {
    res.render("message-form")
});

app.post("/message-form", (req, res, next) => {
    const msg = new Message({
        title: req.body.title,
        author: req.user._id,
        text: req.body.message,
        date: Date.now()
    });

    msg.save()
        .then(() => {
            res.redirect("/messages");
        })
        .catch((err) => {
            next(err);
        });
});

app.get('/messages', (req, res, next) => {
    Message.find({}, "title text author date")
        .sort({ date: -1 })
        .then(all_messages => {
            res.render("messages", {
                title: "Messages",
                messages: all_messages
            });
        })
        .catch(err => {
            next(err);
        })
});



app.listen(3000, () => console.log("app listening on port 3000"));
