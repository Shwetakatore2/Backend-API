const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const { ContactUs } = require("../models");
const { fetchAdmin } = require("../middleware");

// @route   POST api/contactUs
// @desc    Contact Us
// @access  Public
router.post(
  "/",
  [
    body("name", "Enter a valid name").notEmpty(),
    body("email", "Enter a valid email").isEmail(),
    body("number", "Enter a valid number").isLength({ min: 10, max: 13 }),
    body("message", "Enter a valid message").notEmpty(),
  ],
  async (req, res) => {
    // If there are errors return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, number, message } = req.body;
      // Create a new User
      const contactUs = await ContactUs.create({
        name: name,
        email: email,
        number: number,
        message: message,
        date: new Date(),
      });
      contactUs
        .save()
        .then(() => {
          res.json({
            response: "success",
            message: "Your message has been sent successfully",
          });
        })
        .catch((err) => {
          console.log(err.message);
          res.json({
            response: "error",
            message: "Sorry, your message could not be sent",
          });
        });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//@route   Get api/contactUs/getAll
//@desc    Get all contactUs
//@access  Admin

router.get("/getAll", fetchAdmin, async (req, res) => {
  try {
    const contactUs = await ContactUs.find();
    res.json(contactUs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
