const mongoose = require("mongoose");

const BlogsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  headline: {
    type: String,
    //   required: true,
    //   unique: true
  },
  image: {
    data: Buffer,
    type: String,
    //   required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  list: {
    type: String,
  },
  paragraph: {
    type: String,
  },
  seo: {
    seotitle: {
      type: String,
    },
    slung: {
      type: String,
    },
    URL: {
      type: String,
    },
    metakeyword: {
      type: String,
    },
    metadescription: {
      type: String,
    },
  },
});

module.exports = mongoose.model("blogs", BlogsSchema);
