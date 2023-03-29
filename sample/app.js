import express from "express";
import {engine} from "express-handlebars";
import morgan from "morgan";

import flash from "connect-flash";
import session from "express-session";

import bodyParser from "body-parser";
// load mongooes
import mongoose from "mongoose";
// load method override
import methodOverride from "method-override";

import dotenv from "dotenv";
dotenv.config();
console.log(process.env.PORT);
console.log(process.env.mongoURI);
const app = express ();
const PORT = process.env.PORT|| 3100;

mongoose
.connect(process.env.mongoURI)
.then(()=> console.log("Mongodb connected.."))
.catch((err) => console.log(err));

import ideasRoute from "./routes/ideasRoute.js";
import usersRoute from "./routes/usersRoute.js";
import bookingsRoute from "./routes/bookingsRoute.js";

import passport from "passport";
import passportConfig from "./config/passportConfig.js";
passportConfig(passport);

//import Idea from "./models/Idea.js";
//if db does not exist will create db
//console.log ("after mongoose import Idea");
// set up handlebars middleware
app.engine("handlebars", engine());   // select handlebars as template engine 
app.set("view engine","handlebars");  // set view engine
app.set("views","./views");           // set views in folder ./views
app.use(morgan("tiny"));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(
    session({
        secret: "anything",
        resave: true,
        saveUninitialized: true,
        //cookie: { maxAge: 150*1000,},
        //genid: function (req) {
        //  return genuuid ();    
        }
    )
);
app.use(passport.initialize());
app.use(passport.session());

// connect-flash store flash messages in sessions,
// therefore fthe setup of express-session is needed
app.use(flash());

app.use(function(req, res, next){
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.fail_passport = req.flash("fail_passport");
    res.locals.user = req.user || null;
//    console.log ("===Login User===", res.locals.user);
//    console.log ("success_msg", res.locals.success_msg);
//    console.log ("error_msg", res.locals.error_msg);
//    console.log ("fail_passport", res.locals.fail_passport);

    next();
})


app.get("/", (req,res) => {
    res.render("index",{title:"Welcome !"});
});

app.get("/about", (req, res) => {
    res.render("about");
});

import ensureAuthenticated from "./helpers/auth.js";
app.use("/ideas", ensureAuthenticated, ideasRoute);
app.use("/bookings", ensureAuthenticated, bookingsRoute);
app.use("/users", usersRoute);

app.use(function(req,res,next){
    console.log("Time", Date.now());
    next();
});

app.get("*",(req, res) => {
    res.status(404);
    res.render("404");
});

app.listen (PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
