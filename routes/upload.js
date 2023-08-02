const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");

const { Website, Branding, Marketing } = require("../models");

//Uploading a file
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
}).array("user_file", 10);

// POST method for branding
router.post("/branding", (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res.end("Error uploading files");
      } else {
        const { title, description, url } = req.body; // Retrieve the title, description, and URL from the request body
        const files = req.files; // Retrieve the files from the request body
        const images = files.map((file) => ({
          name: file.originalname,
          image: {
            data: fs.readFileSync("uploads/" + file.filename),
            contentType: file.mimetype,
          },
          title,
          description,
          url,
          date: new Date(),
        }));

        if (images.length <= 0) {
          // Delete the files from the uploads folder if no images were found
          if (files.length > 0) {
            files.map((file) => fs.unlinkSync("uploads/" + file.filename));
          }

          return res
            .status(400)
            .send({ response: "error", message: "No images found" });
        } else {
          Branding.insertMany(images) // Use insertMany to insert multiple documents at once
            .then(() => {
              console.log("Images uploaded successfully");
              return res.send({
                response: "success",
                message: "Files have been uploaded",
              });
            })
            .catch((err) => {
              console.log(err.message);
              return res.status(500).send("Internal Server Error");
            });
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

// POST method for website
router.post("/website", (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res.end("Error uploading files");
      } else {
        const { title, description, url } = req.body; // Retrieve the title, description, and URL from the request body
        const files = req.files; // Retrieve the files from the request body
        const images = files.map((file) => ({
          name: file.originalname,
          image: {
            data: fs.readFileSync("uploads/" + file.filename),
            contentType: file.mimetype,
          },
          title,
          description,
          url,
          date: new Date(),
        }));

        if (images.length <= 0) {
          // Delete the files from the uploads folder if no images were found
          if (files.length > 0) {
            files.map((file) => fs.unlinkSync("uploads/" + file.filename));
          }

          return res
            .status(400)
            .send({ response: "error", message: "No images found" });
        } else {
          Website.insertMany(images) // Use insertMany to insert multiple documents at once
            .then(() => {
              console.log("Images uploaded successfully");
              return res.send({
                response: "success",
                message: "Files have been uploaded",
              });
            })
            .catch((err) => {
              console.log(err.message);
              return res.status(500).send("Internal Server Error");
            });
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

// POST method for marketing
router.post("/marketing", (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        console.log(err);
        return res.end("Error uploading files");
      } else {
        const { title, description, url } = req.body; // Retrieve the title, description, and URL from the request body
        const files = req.files; // Retrieve the files from the request body
        const images = files.map((file) => ({
          name: file.originalname,
          image: {
            data: fs.readFileSync("uploads/" + file.filename),
            contentType: file.mimetype,
          },
          title,
          description,
          url,
          date: new Date(),
        }));

        if (images.length <= 0) {
          // Delete the files from the uploads folder if no images were found
          if (files.length > 0) {
            files.map((file) => fs.unlinkSync("uploads/" + file.filename));
          }

          return res
            .status(400)
            .send({ response: "error", message: "No images found" });
        } else {
          Marketing.insertMany(images) // Use insertMany to insert multiple documents at once
            .then(() => {
              console.log("Images uploaded successfully");
              return res.send({
                response: "success",
                message: "Files have been uploaded",
              });
            })
            .catch((err) => {
              console.log(err.message);
              return res.status(500).send("Internal Server Error");
            });
        }
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

// GET method for branding
router.get("/branding/getAll", async (req, res) => {
  try {
    const branding = await Branding.find();
    if (branding.length <= 0) {
      return res
        .status(404)
        .send({ response: "error", message: "No branding images found" });
    } else {
      return res.status(200).send(branding);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

// GET method for website
router.get("/website/getAll", async (req, res) => {
  try {
    const website = await Website.find();
    if (website.length <= 0) {
      return res
        .status(404)
        .send({ response: "error", message: "No website images found" });
    } else {
      return res.status(200).send(website);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

// GET method for marketing
router.get("/marketing/getAll", async (req, res) => {
  try {
    const marketing = await Marketing.find();
    if (marketing.length <= 0) {
      return res
        .status(404)
        .send({ response: "error", message: "No marketing images found" });
    } else {
      return res.status(200).send(marketing);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

//delete branding
//Delete route /branding/delete/:id to delete a branding file

router.delete("/branding/delete/:id", async (req, res) => {
  try {
    const branding = await Branding.findByIdAndDelete(req.params.id);
    if (!branding) {
      return res
        .status(404)
        .send({ response: "error", message: "No branding file found" });
    } else {
      return res.send({
        response: "success",
        message: "Branding file has been deleted",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

//delete marketing
//Delete route /marketing/delete/:id to delete a marketing file

router.delete("/marketing/delete/:id", async (req, res) => {
  try {
    const marketing = await Marketing.findByIdAndDelete(req.params.id);
    if (!marketing) {
      return res
        .status(404)
        .send({ response: "error", message: "No marketing file found" });
    } else {
      return res.send({
        response: "success",
        message: "Marketing file has been deleted",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

//delete website
//Delete route /website/delete/:id to delete a website file

router.delete("/website/delete/:id", async (req, res) => {
  try {
    const website = await Website.findByIdAndDelete(req.params.id);
    if (!website) {
      return res
        .status(404)
        .send({ response: "error", message: "No website file found" });
    } else {
      return res.send({
        response: "success",
        message: "Website file has been deleted",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
