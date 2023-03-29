import express from "express";
import {engine} from "express-handlebars";
import morgan from "morgan"; //? nodemon message

//* load flash & express-session
import flash from "connect-flash";
import session from "express-session";
//* load dotenv -> import before PORT
import dotenv from "dotenv";
    dotenv.config();
    console.log(process.env.PORT);
    console.log(process.env.mongoURI);

//* load body-parser 
import bodyParser from "body-parser"; //? get API - user input variable (e.g numeric)
import path from "path";
import {fileURLToPath} from "url";

//* load mongoose 
import mongoose from "mongoose"; //? node driver
//* load method override
import methodOverride from "method-override"; //? creat, delete variable 

const app = express();
const PORT = process.env.PORT || 3100;//? change from dotenv setting 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//? promise 
mongoose
    .connect(process.env.mongoURI) //? database location e.g. I.P address mongodb://localhost:27017/note-dev
    .then(() => console.log("Mongodb connected.. hello there"))
    .catch((err) => console.log(err));

//* import Idea from './models/Idea.js'; **change to..
//* Refactoring Step 4 
// import { 
//     getIdeas, 
//     getAddIdeas, 
//     postAddIdeas, 
//     deleteIdeas, 
//     getEditIdeas, 
//     putEditIdeas } from "./controllers/ideasController.js";
//* Refactoring Step 5 **change to..
import ideasRoute from "./routes/ideasRoute.js";
import usersRoute from "./routes/usersRoute.js";
//* ADD  ***NEW API
import bookingsRoute from "./routes/bookingsRoute.js";
import contactsRoute from "./routes/contactsRoute.js";
import adminRoute from "./routes/adminRoute.js";
//*
import passport from "passport";
import passportConfig from "./config/passportConfig.js";
import ensureAuthenticated from "./helpers/auth.js";
passportConfig(passport); //? import verify if user login 

//! setup handlebars template engine middleware - (API)
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");
//*
app.use(morgan("tiny"));
//app.use(express.static("views/public"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({extended: false}));//? debug message  
app.use(bodyParser.json()); //? decide conversion format 
app.use(methodOverride("_method")); //? run delete function 
//* session & flash use after bodyParser
app.use(
    session({ //? create sid.signature :{__}
        secret: "anything", //? hash func. (e.g. generate random id by func.)
        resave: true, 
        saveUninitialized: true, //? auth user's tokens 
        //cookie : { maxAge : 15 * 10000 }, //? set time duration e.g auto-logout 150 * 1000
        //genid: function ()
    })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
//* set @ main.handlebars
app.use(function(req,res, next){
    res.locals.success_msg = req.flash("success_msg"); //? locals.__ is a global variable 
    res.locals.error_msg = req.flash("error_msg");
    res.locals.fail_passport = req.flash("fail_passport"); //? pass passportConfig err message
    res.locals.user = req.user || null;

    //* Add *** NEW
     if (req.user)  {
    // console.log("req.user.admin => ",req.user.admin);
    if (req.user.admin == true) {
        res.locals.admin = true;
    }
    else {
        res.locals.admin = false;
    };
    console.log("user ==> ",res.locals.user);
    };
    //console.log("=== login user ===", res.locals.user);
    next(); //? initialize flash() 
});

//! handlebars middleware template engine - (API)
//* middleware (run as single thread) -> top-to-bottom as priority
app.get("/", (req,res) => {
    console.log(req.session.cookie.maxAge / 1000); //?
    //console.log(req.seesion.genid());
    res.render("index",{title : "Welcome !"});
});
//* Before refactoring
app.get("/about", (req,res) => {
    res.render("about");
});
//* Refactoring => Step 1 (func. exp.) => Step 2 (move to bottom)
// const getIdeas = (req,res) => {
//     Idea.find()
//         .lean()
//         .sort({date: "desc"})
//         .then((ideas) => {
//         console.log(ideas);
//         res.render("ideas/ideasIndex", { ideas: ideas });
//     });
    
// };
// const getAddIdeas = (req,res) => {
//     res.render("ideas/add")
// };
// const postAddIdeas = (req,res) => {
//     let errors = []; //* if no variable => array
//     if (!req.body.title) {
//         errors.push({text: "Please add a title"});
//     }
//     if (!req.body.details) {
//         errors.push({text: "Please add some details"});
//     }
//     if (errors.length > 0) {
//         res.render("ideas/add", {
//             errors : errors,
//             title : req.body.title,
//             details : req.body.details,
//         });
//     } else {
//         const newUser = {
//             title : req.body.title,
//             details : req.body.details, 
//         }; //* for edited more databese 
//         new Idea(newUser).save().then(() => {
//             res.redirect("/");
//         });
//     }
//
// };
// //? delete
// const deleteIdeas = (req,res) => {
//     Idea.deleteOne({_id: req.params.id})
//     .then(() => res.redirect("/ideas")); 
// };
// //? edit 
// const getEditIdeas = (req,res) => {
//     Idea.findOne({_id: req.params.id}) //? find unique records
//     .lean()
//     .then((idea) => {
//         res.render("ideas/edit", { idea : idea });
//     });
// };
// //? send data after edit 
// const putEditIdeas = (req,res) => {
//     Idea.findOne({
//         _id: req.params.id,
//     }).then(idea => {
//         idea.title = req.body.title;
//         idea.details = req.body.details;
//         idea.save()
//         .then(()=> {
//             res.redirect("/ideas"); //? GET IDEAS
//         });
//     });
// };
//* Refactoring Step 2
// app.get("/ideas", getIdeas ); 
// app.get("/ideas/add", getAddIdeas);
// app.post("/ideas/add", postAddIdeas);
// app.delete("/ideas/:id", deleteIdeas);
// app.get("/ideas/edit/(:id)", getEditIdeas); 
// app.put("/ideas/edit/:id", putEditIdeas); 
//! middleware 
//* from refactoring Step 5 
app.use("/ideas", ensureAuthenticated, ideasRoute);//? main route 
app.use("/users", usersRoute);//? main route 
//* ADD *** API use
app.use("/bookings", ensureAuthenticated, bookingsRoute);
app.use("/contacts", contactsRoute);
app.use("/admin", adminRoute);
//*
app.use(function(req,res, next){
    console.log("Time", Date.now());
    next(); 
});
//* ADD *** NEW page
app.get("/facilities", (req,res) => {
    res.render("facilities");
});
app.get("/golf", (req,res) => {
    res.render("golf");
});
app.get("/rugby", (req,res) => {
    res.render("rugby");
});
app.get("/squash", (req,res) => {
    res.render("squash");
});
app.get("/tabletennis", (req,res) => {
    res.render("tabletennis");
});
app.get("/tennis", (req,res) => {
    res.render("tennis");
});
app.get("/receipt", (req,res) => {
    res.render("receipt");
});
//* 

app.get("*", (req, res) => {
    res.status(404); 
    //? can be add message ".send("")" 
    //*res.status(404).send("WTF");
    res.render("404");
}); //* 404 

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
