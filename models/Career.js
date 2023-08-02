const mongoose = require("mongoose");

const CareerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  name: {
    type: String,
  },
  experience: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  jobType: {
    type: String,
  },
  jobLocation: {
    type: String,
  },
  salary: {
    type: String,
  },
  allowEmployee: {
    type: Boolean,
  },
  jobTitle: {
    type: String,
  },
  jobDescription: {
    type: String,
  },
  responsibilities: {
    type: String,
  },
});

module.exports = mongoose.model("career", CareerSchema);
