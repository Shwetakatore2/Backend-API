const express = require("express");
const Career = require("../models/Career");
const { body, validationResult } = require("express-validator");
const { fetchAdmin } = require("../middleware");
const router = express.Router();

// Route1: Post a Job
router.post(
  "/postJob",
  fetchAdmin,
  [
    body("jobTitle", "Enter a Valid title").isLength({ min: 3 }),
    body("jobDescription", "Enter a Valid Description").notEmpty(),
    body("responsibilities", "Enter a Valid responsibility").notEmpty(),
    body("experience", "Enter a Valid experience").notEmpty(),
    body("jobType", "Enter a Valid type").optional(),
    body("jobLocation", "Enter a Valid location").optional(),
    body("salary", "Enter a Valid salary").optional(),
    body("allowEmployee", "Enter a Valid option").isBoolean(),
  ],
  async (req, res) => {
    // If there are errors return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Extract job details from the request body
      const {
        jobTitle,
        jobDescription,
        responsibilities,
        experience,
        jobType,
        jobLocation,
        salary,
        allowEmployee,
        name,
      } = req.body;


      // Create a new job object
      const newJob = new Career({
        jobTitle,
        jobDescription,
        responsibilities,
        name,
        experience,
        jobType,
        jobLocation,
        salary,
        allowEmployee,
        user: req.admin.id,
        // createdBy: user.id, // Set the user ID who created the job
      });
      // Save the job to the database
      await newJob
        .save()
        .then(() => {
          res.json({
            response: "success",
            message: "Your job has been posted successfully",
          });
        })
        .catch((err) => {
          console.log(err.message);
          res.json({
            response: "error",
            message: "Sorry, your job could not be posted",
          });
        });
    } catch (error) {
      console.error(error.massage);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Route2: Post a Appilcation
// router.post("/postApplication", []);

module.exports = router;
