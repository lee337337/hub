if (process.env.NODE_ENV !== "production") {
    const dotenv = require('dotenv').config()
}

const express = require("express")
const app = express()
const bcrypt = require("bcrypt")
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
const bodyParser = require("body-parser")

const initializePassport = require("./passport-config")
initializePassport(
    passport, 
    username => users.find(user => user.username === username),
    id => users.find(user => user.id === id)
)

const mysql = require("./mysql")
mysql()

// {username, email, password}
users = [{id: "1", date: "17/3/2023", username: "t", email: "t", password: "$2b$10$oYNYmKVdyr1d/pEBpiOqke21FIg7T./J7JsbUJWqpt9zilEBqHd56"}]
dommes = []
applications = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))

loggedOn = false
currentUser = ""

app.get('/', isAuthenticated, (req, res) => {
    try {currentUser = req.user.username}
    catch(err) {
        
    }
    
    res.render("index.ejs", { authenticate: loggedOn, user: req.user })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render("login.ejs")
})


app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
    loggedOn: true
    
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register.ejs")
})





app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {

        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        
        var dateF = new Date()
        today = dateF.getDate() + '/' + (dateF.getMonth() + 1) + '/' + dateF.getFullYear()
        users.push({
            id: Date.now().toString(),
            date: today,
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
    
    console.log(users)
})


app.delete('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
    });



app.get('/apply', checkAuthenticated, (req, res) => {
    res.render("app.ejs")
})

app.post('/apply', checkAuthenticated, (req, res) => {
    const application = {
      sub: currentUser,
      name: req.body.name,
      dom: req.body.domme,
      question1: req.body.question1,
      question2: req.body.question2,
      question3: req.body.question3,
      question4: req.body.question4,
      question5: req.body.question5,
      question6: req.body.question6
    };
  
    applications.push(application);
    res.redirect('/applications');
  });

  app.get('/applications', checkAuthenticated, (req, res) => {
    res.render('applications.ejs', { applications: applications });
  });


app.get("/applications/:appId", (req, res) => {
    appId = req.params.appId
    application = applications.find(item => item.name === appId)
    res.render("displayApp.ejs", {appId: appId, application: application})
})









function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        loggedOn = true
        
    } else {
    loggedOn = false
    }
    return next()
    
}

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        loggedOn = true
        return next()
    }
    loggedOn = false
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        loggedOn = true
        return res.redirect('/')
    }
    loggedOn = false
    next()
}

app.listen(3000)