const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Handle errors:
const handleErrors = (err) => {
  console.log(err.message, err.code); // The error message always exists, but the error code it doesn't always exist!
  let errors = { email: "", password: "" };

  // Incorrect email:
  if (err.message === "incorrect email") {
    errors.email = "That email is not registered";
  }

  // Incorrect password
  if (err.message === "incorrect password") {
    errors.password = "The password is incorrect";
  }

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

// CREATE JWT
const maxAge = 3 * 24 * 3600; // In JWT the time must be in SECONDS!!
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_TOKEN, {
    expiresIn: maxAge,
  });
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
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    // We need to check if this is a validation error
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
  //   res.send("new signup");
};

module.exports.login_post = async (req, res) => {
  //   console.log(req.body);
  const { email, password } = req.body;
  console.log(email, password);

  // Use a static method in mongoose to login users:
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    // now we have the user:
    res.status(200).json({ user: user._id });
  } catch (err) {
    // We can catch the errors we defined!
    res.status(400).json({ error: err.message });
  }
  // res.send("new login");
};

module.exports.delete_user = async (req, res) => {
  userId = req.params.userId;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    console.log(`User deleted from db: `, deletedUser);

    return res.status(200).json({
      message: `User with id ${userId} deleted from database`,
      deletedUser,
    });
  } catch (err) {
    const errors = handleErrors(err);
    console.log(err.message);
    res.status(400).json({ errors });
    return;
  }
};

module.exports.logout_get = (req, res) => {
  // We can't delete the jwt cookie from the server by we can replace it with a blank cookie with a minimum expiration date
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
