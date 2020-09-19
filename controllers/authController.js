const User = require("../models/User");

// Handle errors:
const handleErrors = (err) => {
  console.log(err.message, err.code); // The error message always exists, but the error code it doesn't always exist!
  let errors = { email: "", password: "" };

  // Duplicate error code:
  if (err.code === 11000) {
    errors.email = "That email is already registered";
    return errors;
  }
  // Validation errors:
  if (err.message.includes("user validation failed"))
    // console.log(Object.values(err.errors));
    Object.values(err.errors).forEach(({ properties }) => {
      //   console.log(properties);
      errors[properties.path] = properties.message;
    });

  return errors;
};

module.exports.signup_get = (req, res) => {
  res.render("signup"); // Se refiere a renderizar 'signup.ejs' !!!!
};

module.exports.login_get = (req, res) => {
  res.render("login");
};

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  try {
    const user = await User.create({ email, password });
    res.status(201).json(user);
  } catch (err) {
    // We need to check if this is a validation error
    const errors = handleErrors(err);
    res.status(400).json(errors);
  }
  //   res.send("new signup");
};

module.exports.login_post = (req, res) => {
  //   console.log(req.body);
  const { email, password } = req.body;
  console.log(email, password);
  res.send("new login");
};
