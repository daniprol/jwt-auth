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

* Minimum length of filed: `minLength: 6`

* Understand the `_v` field: it's only generated when a document(s) is inserted through mongoose.

  The __v field is called the version key. It describes the internal  revision of a document. This __v field is used to track the revisions of a document. By default, its value is zero. In real practice, the __v  field increments by one only when an array is updated. In other  situations, the value of the __v field remains unaffected. So to keep  the track of __v field in such situations, we can do it manually using  the increment operator provided by the mongoose.