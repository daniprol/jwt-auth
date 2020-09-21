const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Please enter an email"],
      unique: true,
      lowercase: true,
      //   validate: [(val) => {}, "Please enter a valid email"],
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please enter an password"],
      minlength: [6, "Minimum password length is 6 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Fire a function BEFORE a doc is saved to the db
userSchema.pre("save", async function (next) {
  // By using a normal function, then 'this' will refer to the model instance
  console.log("User is about to be created and saved to the db", this);
  // We still wont see the field '_v' which is created after saving
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);

  next();
});
// fire a function after a doc is saved to the db
userSchema.post("save", function (doc, next) {
  console.log("New user was created and saved", doc);
  next();
});

// Create a static method to handle the  user login:
userSchema.statics.login = async function (email, password) {
  // Use 'function' to handle 'this' as the user model!
  const user = await this.findOne({ email: email });

  if (user) {
    const auth = await bcrypt.compare(password, user.password); // We don't need any salt to make the password comparison!
    // auth = True or False
    console.log("Bcrypt auth: ", auth);
    if (auth) {
      return user;
    } else {
      throw Error("Incorrect password"); // We can catch this errors with a 'catch' block!
    }
  } else {
    throw Error("Incorrect email"); // We need a 'catch' block to catch this error!
  }
};
const User = mongoose.model("user", userSchema); // It has to be SINGULAR!!!

module.exports = User;
