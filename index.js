const connectToMongo = require("./db");
const express = require("express");
const cors = require("cors");
const app = express();
const port = 5000;

connectToMongo();

app.use(cors());
app.use(express.json());

// available routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/blogs", require("./routes/blogs"));
// app.use("/api/blogs", require("./routes/work"));
// app.use("/api/work", require("./routes/work"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/admin",require("./routes/admin"));
app.use("/api/profileImage",require("./routes/profileImage"));
app.use("/api/contactUs",require("./routes/contactUs"));
app.use("/api/career",require("./routes/career"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
