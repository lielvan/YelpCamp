var express    = require("express"),
    router     = express.Router(),
    passport   = require("passport"),
    User       = require("../models/user");

// ====================
// ROOT ROUTE
// ====================

router.get("/", (req, res) => {
    res.render("landing");
});

// ====================
// AUTH ROUTES
// ====================

// Show register form
router.get("/register", (req, res) => {
    res.render("register", {page: "register"});
});

// Handle sign up logic
router.post("/register", (req, res) => {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            console.log(err);
            res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", `Welcome To YelpCamp ${user.username}`);
            res.redirect("/campgrounds");
        });
    });
});

// Show login form
router.get("/login", (req, res) => {
    res.render("login", {page: "login"});
});

// Hanlde login logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login",
}), (req, res) => {});

// logout
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged You Out!");
    res.redirect("/campgrounds");
});

module.exports = router;