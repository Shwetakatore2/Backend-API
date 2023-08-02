const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

const { ProfileImage, User, Admin } = require("../models");
const { decideMiddleware } = require("../middleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const upload = multer({
  storage: storage,
  onFileUploadStart: (file) => {
    console.log(file.originalname + " is starting ...");
  },
}).single("user_profile");

router.post("/upload", decideMiddleware, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log(err);
      return res.end("Error uploading files.");
    } else {
      try {
        const user_id = !req.header("auth-token") ? req.admin.id : req.user.id;
        const collection = !req.header("auth-token") ? Admin : User;
        const user = await collection.findById(user_id).select("-password");
        const files = req.file;

        const profileImage = new ProfileImage({
          name: user.username,
          image: {
            data: fs.readFileSync("uploads/" + files.filename),
            contentType: files.mimetype,
          },
          user_id: user.id,
          date: new Date(),
        });

        profileImage
          .save()
          .then(() => {
            console.log("Images uploaded successfully");
            return res.send({
              status: "success",
              message: "Files have been uploaded",
            });
          })
          .catch((err) => {
            console.log(err.message);
            return res.status(500).send("Internal Server Error");
          });
      } catch (error) {
        console.log(error.message);
        return res.status(500).send("Internal Server Error");
      }
    }
  });
});

router.get("/get", decideMiddleware, async (req, res) => {
  try {
    const user_id = !req.header("auth-token") ? req.admin.id : req.user.id;

    const profileImage = await ProfileImage.find({
      user_id: user_id,
    }).sort({"_id":-1}).limit(1);

    if (!profileImage) {
      return res.status(404).send("No profile image found");
    }

    return res.send(profileImage[0]);
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
