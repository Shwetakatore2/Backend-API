const express = require("express");
const router = require("express").Router();
const { body, validationResult, oneOf } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const { Admin } = require("../models");
const { fetchAdmin } = require("../middleware");

const JWT_SECRET = process.env.JWT_SECRET;

//Route1: Create a user using : POST "/api/admin/addadmin". No login required
router.post(
  "/addadmin",
  [
    body("email", "Enter a valid email").isEmail(),
    body("name", "Enter a valid name").notEmpty(),
    body("username", "Enter a valid username").isLength({ min: 5 }),
    body("password", "Password must be atleast 5 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, username, password } = req.body;

    try {
      let admin = await Admin.findOne({
        $or: [
          { username: { $regex: username, $options: "i" } }, // Case-insensitive username search
          { email: { $regex: email, $options: "i" } }, // Case-insensitive email search});
        ],
      });
      if (admin) {
        return res.status(400).json({
          response: "error",
          message: "Sorry a user with this email or username is already exists",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);

      // Create a new User
      admin = await Admin.create({
        name: name,
        email: email,
        username: username,
        password: secPass,
        date: new Date(),
      });
      const data = {
        admin: {
          id: admin.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      res.json({ response: "success", authToken: authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Route2: Authenticate a user using : POST "/api/admin/login". No login required

router.post(
  "/login",
  [
    body("username", "Enter a valid username").isLength({ min: 5 }),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    // If there are errors return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
      let admin = await Admin.findOne({
        $or: [{ username: username }, { email: username }],
      });
      if (!admin) {
        return res.status(400).json({
          response: "error",
          message: "Please try to login with correct credentials",
        });
      }

      const passwordCompare = await bcrypt.compare(password, admin.password);
      if (!passwordCompare) {
        return res.status(400).json({
          response: "error",
          message: "Please try to login with correct credentials",
        });
      }

      const data = {
        admin: {
          id: admin.id,
        },
      };
      const adminToken = jwt.sign(data, JWT_SECRET);
      res.json({ response: "success", adminToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Route3: Get loggedin admin details using : get "/api/admin/getadmin". Login required

router.get("/getadmin", fetchAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    res.json(admin);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//Route4: Update admin details using : POST "/api/admin/updateadmin". Login required or old password required
router.put(
  "/updateadmin",
  [
    oneOf([
      body("email", "Enter a valid email").isEmail(),
      body("name", "Enter a valid name").notEmpty(),
      body("email", "Enter a valid username").isLength({ min: 5 }),
      body("password", "Password cannot be blank").exists(),
    ]),
  ],
  fetchAdmin,
  async (req, res) => {
    // If there are errors return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, password, oldpwd } = req.body;
      if (!req.body.oldpwd) {
        //if the user has the login then only he can change the password
        const admin = await Admin.findById(req.admin.id);
        if (name) {
          admin.name = name;
        }
        if (email) {
          admin.email = email;
        }
        if (password) {
          const newPasswordCompare = await bcrypt.compare(
            password,
            admin.password
          );
          if (newPasswordCompare) {
            return res.status(400).json({
              response: "error",
              message: "This password already in use try different password",
            });
          }
          const salt = await bcrypt.genSalt(10);
          const secPass = await bcrypt.hash(password, salt);
          admin.password = secPass;
        }
        await admin.save();

        const data = {
          admin: {
            id: admin.id,
          },
        };

        const authToken = jwt.sign(data, JWT_SECRET);

        res.json({ response: "success", authToken: authToken });
      } else {
        //if the user don't have the login then he can change the password by providing the old password
        const admin = await Admin.findOne({
          $or: [{ email: email }, { username: email }],
        });
        if (!admin) {
          return res.status(400).json({
            response: "error",
            message: "Please try to login with correct credentials",
          });
        }
        const passwordCompare = await bcrypt.compare(oldpwd, admin.password);
        const newPasswordCompare = await bcrypt.compare(
          password,
          admin.password
        );
        if (newPasswordCompare) {
          return res.status(400).json({
            response: "error",
            message: "This password already in use try different password",
          });
        }
        if (!passwordCompare) {
          return res.status(400).json({
            response: "error",
            message: "Please try to login with correct credentials",
          });
        } else {
          if (name) {
            admin.name = name;
          }
          if (email) {
            admin.email = email;
          }
          if (password) {
            const salt = await bcrypt.genSalt(10);
            const secPass = await bcrypt.hash(password, salt);
            admin.password = secPass;
          }
          await admin.save();
          const data = {
            admin: {
              id: admin.id,
            },
          };

          const authToken = jwt.sign(data, JWT_SECRET);

          res.json({ response: "success", authToken: authToken });
        }
      }
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;
