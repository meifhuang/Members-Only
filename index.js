const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Message = require('./models/Message');
const favicon = require('serve-favicon'); 
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));


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
                return done(null, false, { message: "Incorrect email" });
            }
            bcrypt.compare(password, user.password)
                .then(res => {
                    if (res) {
                       
                        return done(null, user);
                    } else {
                        
                        return done(null, false, { message: "Incorrect password" });
                    }
                })
                .catch(err => {
                  
                    return done(err);
                })
        })
        .catch(err => {
            
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

app.get('/', (req, res) => {
    res.render("index", {user: req.user, method: req.method, signupError: false, loginError: false, codeCorrect: false})
})

app.get("/messages/:page", (req, res) => {
    const perpage = 10;
    const page = Number(req.params.page) || 1;
    Message.find({})
    .skip((perpage * page) - perpage)
    .limit(perpage)
    .populate('author')
    .sort({ date: -1 })
    .then(all_messages => {
        Message.countDocuments()
        .then(count => { 
            res.render("messages", {
                title: "Messages",
                messages: all_messages,
                user: req.user,
                current: page,
                pages: Math.ceil(count / perpage),
                method: req.method,
            });
        })})
        .catch(err => {
            next(err);
        })
});

app.post("/sign-up", [ 
    body("first")
    .trim().isLength({min: 1}).escape()
    .withMessage("First name must be specified"),

    body('last')
    .trim().isLength({min: 1}).escape()
    .withMessage("Last name must be specified"),

    body('email')
    .isEmail()
    .withMessage("Email is invalid"),
    
    body("password").isLength({min: 6})
    .withMessage("please try again and enter at least 6 characters for your password")

], (req, res, next) => { 

        let errors = validationResult(req);

        if (errors.isEmpty()) {

        User.findOne({email: req.body.email})
                .then(found_user => {
                    if (found_user) {
                        errors = []
                        errors.push({msg: 'An account under this email already exists. Please log in instead.'});
                        res.render('index', { 
                            user: req.user, 
                            method: req.method,
                            signupError: true,
                            errors: errors
                        })
                    }
                    else {
                        bcrypt.hash(req.body.password,10)
                        .then(hashedPass => {
                                const user = new User({
                                    first: req.body.first,
                                    last: req.body.last,
                                    email: req.body.email,
                                    password: hashedPass
                                })
                        return user.save() })
                        .then(() => {
                        res.render("index", {
                            user: req.user, 
                            method: req.method,
                            signupSuccess: true,
                            errors: errors
                        })})
                        .catch(err => {
                                next(err); })
                        }
                    })
                }
        else {
            res.render('index', {
                user: req.user, 
                method: req.method,
                errors: errors.array(),
                signupError: true
            })
    }
})

app.post('/log-in', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login-fail',
}));

app.get('/login-fail', (req,res) => {
    res.render('index', {
        user: req.user, 
        method: 'GET',
        loginError: true
    })
})

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
    res.render("message-form", { user: req.user })
});

app.post("/message-form", (req, res, next) => {
    console.log(req.user)
    const msg = new Message({
        title: req.body.title,
        author: req.user._id,
        text: req.body.message,
        date: Date.now()
    });

    msg.save()
        .then(() => {
            res.redirect("/messages/1");
        })
        .catch((err) => {
            next(err);
        })
    });

app.post('/join-club', (req, res, next) => {
    const enteredCode = req.body.code;
    if (enteredCode === process.env.member_code) {
        User.findByIdAndUpdate(req.user._id, { member: true})
            .then(user => {
                res.render('code', {
                    user: req.user, 
                    codeCorrect: true
                })
            })
            .catch(err => {
                next(err);
            })
    }
    else {
        res.render('code', {
            user: req.user, 
            codeCorrect: false
        })
    }
})

// app.use((req, res) => {
//     res.status(404).render('err');
//   });


app.listen(3000, () => console.log("app listening on port 3000"));