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

