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

const User = mongoose.model("user", userSchema); // It has to be SINGULAR!!!

module.exports = User;
