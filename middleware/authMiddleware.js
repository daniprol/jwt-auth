const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  // The token might not be there
  if (token) {
    jwt.verify(token, process.env.JWT_TOKEN, (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/login");
      } else {
        console.log(decodedToken);
        return next();
      }
    });
  } else {
    res.redirect("/login");
  }
};

// Check current user :
const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.JWT_TOKEN, async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null; // Otherwise it will throw an error when we try to access it in the view
        return next();
      } else {
        console.log(decodedToken); // The decoded token has the user's id
        let user = await User.findById(decodedToken.id);

        // We need to inject this user in the response:
        res.locals.user = user; // This 'locals' will be accesible in the views
        return next();
      }
    });
  } else {
    res.locals.user = null;
    return next();
  }
};

module.exports = { requireAuth, checkUser };
