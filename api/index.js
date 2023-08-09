const express = require("express");
const app = express();
const cors = require("cors");
const User = require("./models/User");
const Place = require("./models/Place");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "a>3D(6jl^3kO.|n`=Q]}(?hCw~Ylp3#_";

//
// const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");

//

const imgDownloader = require("image-downloader");
const multer = require("multer");

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.use(express.json());
// app.use(fileUpload({ useTempFiles: true }));
app.use(cookieParser());
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

mongoose.connect(process.env.MONGO_URL);

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userDoc = await User.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (error) {
    res.status(422).json(error);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userDoc = await User.findOne({ email });
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign(
        { email: userDoc.email, id: userDoc._id },
        jwtSecret,
        {},
        (error, token) => {
          if (error) throw error;
          res.cookie("token", token).json(userDoc);
        }
      );
    } else {
      res.status(422).json("pass not ok");
    }
  } else {
    res.json("user does not exist");
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

app.post("/upload-by-link", async (req, res) => {
  const { link } = req.body;
  const result = await cloudinary.uploader.upload(link, {
    use_filename: true,
    folder: "air-bnb",
  });
  //   fs.unlinkSync('/Users/a47/Desktop/airbnb/api/tmp');
  return res.status(200).json(result.secure_url);
  //   console.log(result);

  //   res.json(newName);
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (error, userData) => {
      if (error) throw error;
      const userDoc = await User.findById(userData.id);
      const { name, email, _id } = userDoc;
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
});

const photosMiddleware = multer({ dest: "uploads/" });
app.post(
  "/uploads",
  photosMiddleware.array("photos", 100),
  async (req, res) => {
    const uploadedFiles = [];
    for (let i = 0; i < req.files.length; i++) {
      const { filename } = req.files[i];
      const imagePath = path.join(__dirname, "/uploads/" + `${filename}`);
      try {
        const result = await cloudinary.uploader.upload(imagePath, {
          use_filename: true,
          folder: "air-bnb",
        });
        uploadedFiles.push(result.secure_url);
        fs.unlinkSync(imagePath);
      } catch (error) {
        console.log(error);
      }
    }
    return res.status(200).json(uploadedFiles);
  }
);

app.post("/places", (req, res) => {
  const {
    title,
    address,
    addedPhotos,
    description,
    perks,
    extraInfo,
    checkIn,
    checkOut,
    maxGuests,
  } = req.body;
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (error, userData) => {
    if (error) throw error;
    const placeDoc = await Place.create({
      owner: userData.id,
      title,
      address,
      photos: addedPhotos,
      description,
      perks,
      extraInfo,
      checkIn,
      checkOut,
      maxGuests,
    });
    res.json(placeDoc);
  });
});

app.get("/places", (req, res) => {
  const { token } = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (error, userData) => {
    if (error) throw error;
    const { id } = userData;
    const places = await Place.find({ owner: id });
    res.json(places);
  });
});

app.get("/places/:id", async (req, res) => {
  const { id } = req.params;
  const place = await Place.findById(id);
  // console.log(place);
  res.json(place);
});

app.listen(4000);
