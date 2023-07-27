//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);
console.log(process.env.SECRET);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/userDB");
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled

  const userSchema = new mongoose.Schema({
    email: String,
    password: String,
  });

  userSchema.plugin(encrypt, {
    secret: process.env.SECRET, // Use the SECRET environment variable as the encryption/decryption key.
    encryptedFields: ["password"],
  });

  const User = mongoose.model("User", userSchema);

  app.get("/", (req, res) => {
    res.render("home");
  });

  app.get("/register", (req, res) => {
    res.render("register");
  });

  app.post("/register", (req, res) => {
    // Before saving any new entries, make sure that the same {email-id} doesn't exist twice

    const user_requested_email = req.body.username;

    User.find({ email: user_requested_email })
      .then((foundList) => {
        // console.log(foundList);
        // console.log(foundList.length);

        if (foundList.length === 0) {
          const newUser = new User({
            email: req.body.username,
            password: req.body.password,
          });
          newUser.save();
          res.render("secrets");
        } else {
          res.send("Email Already exists");
        }
      })
      .catch((err) => {
        res.send(`Error Finding Email: ${err}`);
      });
  });

  app.get("/login", (req, res) => {
    res.render("login");
  });

  app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
      const foundName = await User.findOne({ email: username });
      if (foundName) {
        if (foundName.password === password) {
          res.render("secrets");
        } else {
          console.log("Password Does not Match...Try Again !");
        }
      } else {
        console.log("User Not found...");
      }
    } catch (err) {
      console.log(err);
    }
  });

  app.listen(3000, () => {
    console.log("Server is runing on port 3000...   ");
  });
}
