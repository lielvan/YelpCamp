var middlewareObj = {},
    Campground    = require("../models/campground"),
    Comment       = require("../models/comment");

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err || !foundCampground) {
            req.flash("error", "Campground Not Found");
            res.redirect("back");
        } else {
            if(foundCampground.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You Don't Have Permission To Do That");
                res.redirect("back");
            }
        }
    });
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    Comment.findById(req.params.comment_id, (err, foundComment) => {
        if(err || !foundComment) {
            req.flash("error", "Comment Not Found");
            res.redirect("back");
        } else {
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
                req.flash("error", "You Don't Have Permission To Do That");
                res.redirect("back");
            }
        }
    });
};

middlewareObj.isLoggedIn = function(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in to do that");
    res.redirect("/login");
};

module.exports = middlewareObj;