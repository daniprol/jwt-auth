if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
// Import routes
const authRoutes = require("./routes/authRoutes");

const app = express();

// Use morgan to log all requests:
app.use(morgan("dev"));
// middleware
app.use(express.static("public"));
// To be able to parse json objects in the body of the requests:
app.use(express.json());
// Cookie parser:
app.use(cookieParser());

// view engine
app.set("view engine", "ejs");

// database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then((result) => {
    console.log("Database connected");

    // We only set the server if the db connection is successful
    app.listen(3000, () => {
      console.log("Server listening on port 3000");
    });
  })
  .catch((err) => console.log(err));

// routes
app.get("/", (req, res) => res.render("home"));
app.get("/smoothies", (req, res) => res.render("smoothies"));
app.use(authRoutes); // No hace falta poner el slash /  en este caso

// Cookies
app.get("/set-cookies", (req, res) => {
  // res.setHeader("Set-cookie", "newUser=true");
  res.cookie("newUser", false); // It the cookie exists it will overwrite it!
  res.cookie("isSunday", true); // It the cookie exists it will overwrite it!
  res.cookie("isEmployee", false, {
    maxAge: 1000 * 60 * 60 * 24,
    // secure: true,
    httpOnly: true,
  });
  res.send("You got the new cookie!");
});

app.get("/read-cookies", (req, res) => {
  const cookies = req.cookies;
  // const cook = req.headers.cookie;
  console.log(cookies);
  // console.log(cook);
  // res.json(cook);
  res.json(cookies);
});
