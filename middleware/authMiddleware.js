const jwt = require("jsonwebtoken");

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

module.exports = { requireAuth };
