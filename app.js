const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

mongoose.connect("********", { useNewUrlParser: true, useUnifiedTopology: true });

let signedIn = false;
let currentUser = "";
let currentUserE = "";

const userSchema = {
    name: String,
    email: String,
    password: String
};

const User = mongoose.model("User", userSchema);

const postSchema = {
    name: String,
    email: String,
    post: String
};

const Post = mongoose.model("Post", postSchema);

app.route("/")
    .get(function (req, res) {
        res.render("home", { signedIn: signedIn, currentUser: currentUser });
    })
    .post(function (req, res) {
        signedIn = false;
        currentUserE = "";
        currentUser = "";
        res.redirect("/");
    });

app.route("/signup")
    .get(function (req, res) {
        res.render("signup");
    })
    .post(function (req, res) {
        // Register the new user into the database
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            posts: []
        });
        newUser.save();
        // Redirect the user to login
        res.redirect("/login");
    });

app.route("/login")
    .get(function (req, res) {
        res.render("login");
    })
    .post(function (req, res) {
        // Looks for match between email and password for a user
        try {
            User.findOne({ email: req.body.email }, function (err, foundUser) {
                if (!err) {
                    if (foundUser.password == req.body.password) {
                        signedIn = true;
                        currentUser = foundUser.name;
                        currentUserE = foundUser.email;
                        res.redirect("/");
                    } else {
                        res.redirect("/login");
                    }
                }
            });
        } catch (error) {
            res.redirect("/login");
        }

    });

app.route("/entries").get(function (req, res) {
    if (signedIn) {
        Post.find({}, function (err, results) {
            if (!err) {
                res.render("entries", { signedIn: signedIn, currentUser: currentUser, results: results.reverse() });
            } else {
                res.render("home", { signedIn: signedIn, currentUser: currentUser });
            }
        });
    }
});

app.route("/create")
    .get(function (req, res) {
        res.render("create", { signedIn: signedIn, currentUser: currentUser })
    })
    .post(function (req, res) {
        if (signedIn) {
            Post.countDocuments({}, function (err, numPosts) {
                // Cap on the amount of posts
                if (numPosts >= 30) {
                    Post.deleteMany({}, function (err) { });
                }
                const newEntry = req.body.entry;
                const newPost = new Post({
                    name: currentUser,
                    email: currentUserE,
                    post: newEntry
                });
                newPost.save();
                res.redirect("/entries");
            });
        }
    });


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}

app.listen(port, function () {
    console.log("Server successfully started")
});
