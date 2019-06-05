var express    = require("express"),
    router     = express.Router(),
    Campground = require("../models/campground"),
    middleware = require("../middleware");

var NodeGeocoder = require('node-geocoder');
var options = {
    provider: 'google',
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};
var geocoder = NodeGeocoder(options);

// INDEX - shows all campgrounds
router.get("/", (req, res) => {
    Campground.find({}, (err, allCampgrounds) => {
        if(err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});
        }
    })
});

// CREATE - create new campground
router.post("/", middleware.isLoggedIn, (req, res) => {
    // Get data from form
    var name = req.body.name,
        image = req.body.image,
        description = req.body.description,
        price = req.body.price,
        author = {
            id: req.user._id,
            username: req.user.username
        };
    geocoder.geocode(req.body.location, (err, data) => {
        if(err || !data.length) {
            console.log(err);
            req.flash("error", "Invalid Address");
            return res.redirect("back");
        }
        var lat = data[0].latitude,
            lng = data[0].longitude,
            location = data[0].formattedAddress,
            newCampground = {
                name: name,
                image: image,
                description: description,
                price: price,
                author: author,
                location: location,
                lat: lat,
                lng: lng
            };
        Campground.create(newCampground, (err) => {
            if(err) {
                console.log(err);
            } else {
                // Redirect back to campgrounds list page
                console.log(newCampground);
                res.redirect("/campgrounds");
            }
        });
    });
});

// NEW - create new campground
router.get("/new", middleware.isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

// SHOW - shows info about single campground
router.get("/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec((err, foundCampground) => {
        if(err || !foundCampground) {
            req.flash("error", "Campground Not Found");
            return res.redirect("back");
        }
        console.log(foundCampground);
        res.render("campgrounds/show", {campground: foundCampground});
    });  
});

// EDIT - show campground edit form
router.get("/:id/edit", middleware.isLoggedIn, middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE - update campground
router.put("/:id", middleware.isLoggedIn, middleware.checkCampgroundOwnership, (req, res) => {
    geocoder.geocode(req.body.campground.location, (err, data) => {
        if(err || !data.length) {
            console.log(err);
            req.flash("error", "Invalid Address");
            return res.redirect("back");
        }
        req.body.campground.lat = data[0].latitude,
        req.body.campground.lng = data[0].longitude,
        req.body.campground.location = data[0].formattedAddress;

        Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
            if(err) {
                req.flash("error", err.message);
                res.redirect("/campgrounds");
            } else {
                req.flash("success", "Successfully Updated");
                res.redirect(`/campgrounds/${req.params.id}`);
            }
        });
    });
});

// DESTROY - delete campground
router.delete("/:id", middleware.isLoggedIn, middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, (err, campgroundRemoved) => {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        }
        Comment.deleteMany({_id: { $in: campgroundRemoved.comments }}, (err) => {
            if(err) {
                console.log(err);
            }
            req.flash("success", "Campground Deleted");
            res.redirect("/campgrounds");
        });
    });
});

module.exports = router;