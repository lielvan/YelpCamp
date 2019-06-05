require('dotenv').config();
// ==============================
// GLOBAL VARIABLES DECLARATIONS
// ==============================
const express   = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose");
    flash       = require("connect-flash");
    port        = 3000;
    seedDB      = require("./seeds");
    passport    = require("passport");
    LocalStrategy = require("passport-local");
    methodOverride = require("method-override");

// Models
var Campground  = require("./models/campground");
    Comment     = require("./models/comment");
    User        = require("./models/user");

// Routes
var campgroundRoutes = require("./routes/campgrounds"), 
    commentRoutes    = require("./routes/comments"),
    indexRoutes      = require("./routes/index");

// MongoDB Connection
mongoose.connect("mongodb+srv://lvdh:lvdH1856@cluster0-15lep.mongodb.net/yelp_camp?retryWrites=true", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
}).then(() => {
    console.log("Connected to db");
}).catch(err => {
    console.log(`Error: ${err}`);
});

// App Config
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();

// Passport Config
app.use(require("express-session")({
    secret: "Bolt",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Export data throughout app
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.moment = require("moment");
    next();
});

// Routes Config
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

app.listen(port, console.log(`YelpCamp Server Started... Listening on localhost port ${port}`));
// app.listen(process.env.PORT, process.env.IP , console.log(`YelpCamp Server Started... Listening on localhost port ${process.env.PORT}`));