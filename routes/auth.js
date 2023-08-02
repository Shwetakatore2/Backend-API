const express = require("express");
const router = express.Router();
const { body, validationResult, oneOf } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { User } = require("../models");
const { fetchUser, fetchAdmin } = require("../middleware");
const JWT_SECRET = process.env.JWT_SECRET;

//Route1: Create a user using : POST "/api/auth/adduser". No login required
router.post(
  "/adduser",
  [
    body("roles", "Enter a valid role").isArray(),
    body("email", "Enter a valid email").isEmail(),
    body("username", "Enter a valid username").isLength({ min: 6 }),
    body("password", "Password must be atleast 8 character").isLength({
      min: 8,
    }),
  ],
  fetchAdmin,
  async (req, res) => {
    // If there are errors return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({
        $or: [
          { username: req.body.username }, // Case-insensitive username search
          { email: req.body.email }, // Case-insensitive email search});
        ],
      });
      if (user) {
        return res.status(400).json({
          response: "error",
          message: "Sorry a user with this email or username is already exists",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      // Create a new User
      user = await User.create({
        roles: req.body.roles,
        email: req.body.email,
        username: req.body.username,
        password: secPass,
        date: new Date(),
      });
      const data = {
        user: {
          id: user.id,
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

//Route2: Authenticate a user using : POST "/api/auth/login". No login required
router.post(
  "/login",
  [
    body("username", "Enter a valid username").isLength({ min: 6 }),
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
      let user = await User.findOne({
        $or: [{ username: username }, { email: username }],
      });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please try to login with correct credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      res.json({ authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Route3: Get logged In details user using : POST "/api/auth/getuser". login required
router.post(
  "/getuser",
  fetchUser,

  async (req, res) => {
    try {
      userId = req.user.id;
      const user = await User.findById(userId).select("-password");
      res.send(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//Route4: Search users by username or email
router.get("/search", async (req, res) => {
  const { query } = req.query;

  try {
    // Perform the search query
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: "i" } }, // Case-insensitive username search
        { email: { $regex: query, $options: "i" } }, // Case-insensitive email search
      ],
    }).select("-password");

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//Route5: Delete a user using : DELETE "/api/auth/deleteuser". Login required
router.delete("/deleteuser", fetchAdmin, async (req, res) => {
  try {
    const user_id = req.body.user_id;
    // Find the user by username and delete
    const user = await User.findByIdAndDelete({ _id: user_id });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

//Route6: Update a user using : PUT "/api/auth/updateuser". Login required
router.put(
  "/updateuser",
  fetchAdmin,
  [
    oneOf([
      body("roles", "Enter a valid role").isArray(),
      body("email", "Enter a valid email").isEmail(),
      body("username", "Enter a valid username").isLength({ min: 6 }),
      body("password", "Password must be atleast 8 character").isLength({
        min: 8,
      }),
    ]),
  ],
  async (req, res) => {
    // If there are errors return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, roles, password, user_id } = req.body;
      // Find the user to be updated and update it
      const user = await User.findById(user_id);
      if (!user) {
        return res.status(404).send("User not found");
      }
      if (username) {
        if (username !== user.username) {
          user.username = username;
        } else {
          return res.status(400).json({
            response: "error",
            message: "Username already in use try different username",
          });
        }
      }
      if (email) {
        if (email !== user.email) {
          user.email = email;
        } else {
          return res.status(400).json({
            response: "error",
            message: "Email already in use try different email",
          });
        }
      }
      if (roles.length > 0) {
        if (roles !== user.roles) {
          user.roles = roles;
        } else {
          return res.status(400).json({
            response: "error",
            message: "Roles are already associated with user",
          });
        }
      }

      if (password) {
        const passCompare = bcrypt.compareSync(password, user.password);
        if (passCompare) {
          return res.status(400).json({
            response: "error",
            message: "Password already in use try different password",
          });
        }
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        user.password = hash;
      }

      await user
        .updateOne({
          roles: user.roles,
          email: user.email,
          username: user.username,
          password: user.password,
        })
        .then(() => {
          res.json({
            response: "success",
            message: "User updated successfully",
          });
        })
        .catch((err) => {
          console.log(err.message);
          res.status(400).json({
            response: "error",
            message:
              "Something went wrong while updating user please try again",
          });
        });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

//route7: Get all users using : GET "/api/auth/getallusers". Admin Login required

router.get("/getallusers", fetchAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
