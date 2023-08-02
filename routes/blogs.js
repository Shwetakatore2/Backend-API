const express = require("express");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const Blogs = require("../models/Blogs");
const { body, validationResult } = require("express-validator");

//Route1: Get all blogs using GET : POST "/api/auth/fetchallblogs". No login required
router.get("/fetchallblogs", fetchuser, async (req, res) => {
  try {
    const blogs = await Blogs.find({ user: req.user.id });
    res.json(blogs);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//Route2: add a new blog using : POST "/api/auth/addblogs". login required
router.post(
  "/addblogs",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("text", "Text must be atleast 5 character").isLength({ min: 3 }),
  ],
  async (req, res) => {
    try {
      const { title, text } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const blog = new Blogs({
        title,
        text,
        user: req.user.id,
      });
      const savedblog = await blog.save();
      res.json(savedblog);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Route3: add a new SEO using : POST "/api/auth/addseo". login required
router.post(
  "/addseo",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("text", "Text must be atleast 5 character").isLength({ min: 3 }),
    body("seotitle", "Enter a valid seo title").isLength({ min: 3 }),
    body("slung", "Slung must be atleast 5 character").isLength({ min: 3 }),
    body("URL", "Enter a valid URL").isURL(),
    body("metakeyword", "metakeyword must be atleast 5 character").isLength({
      min: 3,
    }),
    body(
      "metadescription",
      "metadescription must be atleast 5 character"
    ).isLength({ min: 3 }),
  ],
  async (req, res) => {
    try {
      const {
        seotitle,
        slung,
        URL,
        metakeyword,
        text,
        title,
        metadescription,
      } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const seo = new Blogs({
        seotitle,
        slung,
        URL,
        metakeyword,
        metadescription,
        text,
        title,
        user: req.user.id,
      });
      const savedseo = await seo.save();
      res.json(savedseo);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Route4: Search blogs by title
router.get("/searchblog", async (req, res) => {
  const { query } = req.query;

  try {
    // Perform the search query
    const blogsfind = await Blogs.find({
      $or: [
        { title: { $regex: query, $options: "i" } }, // Case-insensitive title search
      ],
    });

    res.json(blogsfind);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
