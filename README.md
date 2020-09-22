## NodeJS app with JWT authentication

### Express

* To be able to receive (parse) json in the body of the requests: `app.use(express.json())`
* 

### EJS

* Setup: `app.set('view engine', 'ejs');`

* **Render** a page:

```js
  // The views/index.ejs exists in the app directory
  app.get('/hello', function (req, res) {
    res.render('index', {title: 'title'});
  });
```

* Use a **partial**:

```js
var path = require('path');
app.set('views', path.join(__dirname, 'views')); 
```

Then to include a *partial*. Note that the partial directory will be relative to the `views` directory that we specified!

```js
<%- include('myview.ejs') %>
```

**IMPORTANT:** this syntax to include partials is new and may not work in older versions of ejs! Express 3.x doesn't support `partial` anymore!

* Create a **template:**

  ```js
  var EJSLayout = require('express-ejs-layouts');
  app.use(EJSLayout);
  ```

  This will use the `views/layout.ejs` as your layout.

* How to apply a middleware to every single route:

  ```js
  app.use('*', checkUser)
  ```

  

### Mongoose

* **WARNING:** when creating a new model the name **MUST** be <u>singular</u> (mongoose will take care of creating the collection with the plural name!).

  ```js
  const User = mongoose.model('user', userSchema) // It has to be SINGULAR!!!
  ```

* Alternatives to create a new document:

  ```js
  const user = await User.create({ email, password }); // OPTION 1
  
  const user = new User({ email, password }) // OPTION 2
  user.save()
  ```

  

* Store field as lowercase: (*GREAT TO AVOID PROBLEMS WITH THINGS LIKE EMAILS!*)

  ```js
  Schema({
      email: {
          type: String,
          unique: true,
          lowercase: true
      }
  })
  ```

* Minimum length of filed: `minlength: 6`

* Understand the `_v` field: it's only generated when a document(s) is inserted through mongoose.

  The __v field is called the version key. It describes the internal  revision of a document. This __v field is used to track the revisions of a document. By default, its value is zero. In real practice, the __v  field increments by one only when an array is updated. In other  situations, the value of the __v field remains unaffected. So to keep  the track of __v field in such situations, we can do it manually using  the increment operator provided by the mongoose.

#### Mongoose Validation

```shell
npm install validator
```



 we can add custom validation messages when defining the model schema with mongoose:

```js
    email: {
      type: String,
      required: [true, "Please enter an email"],
      unique: true,
      lowercase: true,
      validate: [(val) => {console.log('Validation here')}, "Please enter a valid email"],
    },

```

We can use custom functions to validate:

```js
validate: [isEmail, 'Please enter a valir email']
```

To implement this validation we need to use a try/catch block and check for the type of error message before sending back to the user the problem.

We usually receive a message starting with `user validation failed: ` followed by all the fields that were invalid

**IMPORTANT:** the `catch(error)` when trying to create an user will have any validation message embedded!

```js
  try {
    const user = await User.create({ email, password });
    res.status(201).json(user);
  } catch (err) { 
    // We need to check if this is a validation error
    const errors = handleErrors(err);
    res.status(400).json(errors);
  }


const handleErrors = (err) => {
  console.log(err.message, err.code); // The error message always exists, but the error code it doesn't always exist!
  let errors = { email: "", password: "" };

  // Validation errors:
  if (err.message.includes("user validation failed"))
    // console.log(Object.values(err.errors));
    Object.values(err.errors).forEach(({ properties }) => {
      //   console.log(properties);
      errors[properties.path] = properties.message;
    });

  return errors;
};

```

In the case of having a duplicate entry error, this will not be handled by the validation library. We need to do it manually. If we console log the error message and code:

```shell
E11000 duplicate key error collection: jwt-auth.users index: email_1 dup key: { email: "daniprol@hotmail.com" } 11000
```

We can add this part to the `handleErrors` functions:

```js
  // Duplicate error code:
  if (err.code === 11000) {
      errors.email = 'That email is already registered'
      return errors
  }
```

#### Mongoose hooks:

Function that fires after specific events happen (e.g., when a user is saved into the database).

```js
// Fire a function BEFORE a doc is saved to the db
userSchema.pre("save", function (next) {
  // By using a normal function, then 'this' will refer to the model instance
  console.log("User is about to be created and saved to the db", this);
  // We still wont see the field '_v' which is created after saving
  next();
});

// fire a function after a doc is saved to the db
userSchema.post("save", function (doc, next) {
  console.log("New user was created and saved", doc);
  next();
});

```

* We can use this to hashed passwords before the documents are created in the database.

```js
userSchema.pre("save", async function (next) {
  const salt = bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

#### Create a login function with mongoose static methods

Mongoose doesn't have a default function to handle login processes, but we can create one by attaching a static method to the object.

```js
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

```

We can call this function when the `/login` route is accessed:

```js
module.exports.login_post = async (req, res) => {
  //   console.log(req.body);
  const { email, password } = req.body;
  console.log(email, password);

  // Use a static method in mongoose to login users:
  try {
    const user = await User.login(email, password);
    // now we have the user:
    res.status(200).json({ user: user._id });
  } catch (err) {
    // We can catch the errors we defined!
    res.status(400).json({ error: err.message });
  }
  // res.send("new login");
};

```

All of this will be access from the front-end with a **FETCH** request!

```js
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset errors every time the form is submitted:
    emailError.textContent = "";
    passwordError.textContent = "";
    // get the values from the form
    const email = form.email.value;
    const password = form.password.value;

    console.log(email, password);
    try {
      const res = await fetch("/login", {
        method: "POST",
        body: JSON.stringify({ email: email, password: password }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json(); // We receive a JSON response from the server
      console.log(data);

      if (data.errors) {
        emailError.textContent = data.errors.email;
        if (data.errors.email.length > 0) {
          form.email.value = "";
        }
        passwordError.textContent = data.errors.password;
        // if (data.errors.password.length > 0) {
        form.password.value = "";
        // }
      }

      if (data.user) {
        // location.assign("/");
      }
    } catch (err) {
      console.log(err);
    }
    // form.reset();
  });

```

