//
/*
    We are using express and nodejs, as well as mongoose for data storage
    If this is your first time opening this project, you need to run the following command: "npm install" to install all dependencies
    If the above command didn't work and the server still can't start then you will have to manually install using "npm install express" for example for each dependency
    To start the server, use "npm start" since this way it will update the server when changes are saved (no annoying server reset required)
*/

// import dependencies
const express = require('express')
const cookieParser = require('cookie-parser')
const hbs = require('express-handlebars')
const bodyParser = require('body-parser')
const session = require('express-session')
const path = require('path')

const mongoose = require('mongoose') //mongodb
const config = require('config') //access config
const User = require('./models/User') //get user js for Mongo
const { request } = require('http')

const app = express()
const port = 8080

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser('secret'))
app.use(express.static(path.join(__dirname, 'public'))) //put any static file that needs to be accessed under "public"

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
    // cookie: { secure: false }
  })
)

//We are using handlebars template engine to display html files, any .html files are not needed, everything will be done in .hbs
app.engine(
  'hbs',
  hbs.engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layouts/'
  })
)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')

const db = config.get('mongoURL') //pull db information from config
mongoose.connect(
  db, //connect to db
  err => {
    if (err) throw err
    console.log('Connected to MongoDB!')
  }
)

// Don't create random users, it will clutter MongoDB
// We are using session variables to keep track of any variables needed
// user account: user@abc, 123
// admin account: Admin@abc, 123
app
  .route('/sign_in')
  .get(function (req, res) {
    if (req.session.logged_in) {
      console.log(
        'Attempt to go to login page while already logged in, current user: ' +
          request.session.username
      )
      res.redirect('/dashboard')
    } else {
      res.render('sign', { title: 'Sign In' })
    }
  })
  .post(async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email }).lean()

    if (!user) {
      return res.redirect('/sign_in?error=1') // IDK how your form handles errors, edit this when you can
    }

    if (password == user.password) {
      req.session.logged_in = true
      req.session.username = user.username
      req.session.type = user.type
      req.session.community_name = user.community_name
      res.redirect('/dashboard')
    } else {
      res.redirect('/sign_in?error=1') // see above comment
    }
  })

//register
app
  .route('/sign_up')
  .get(function (req, res) {
    res.render('sign', { title: 'Sign In' })
  })
  .post(async function (req, res) {
    const { username, password: plainTextPassword, accept_con } = req.body

    if (!username || typeof username !== 'string') {
      console.log('Invalid username')
      return res.redirect('/sign_up?error=1') // IDK how your form handles errors, edit this when you can
    }

    if (!plainTextPassword || typeof plainTextPassword !== 'string') {
      console.log('Invalid password')
      return res.redirect('/sign_up?error=1') // see above comment
    }

    if (plainTextPassword != req.body.passwordcheck) {
      console.log('Password does not match')
      return res.redirect('/sign_up?error=1') // see above comment
    }

    if (!accept_con) {
      console.log('Password does not match')
      return res.redirect('/sign_up?error=1') // see above comment
    }

    const newUser = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      type: 'User',
      community_name: req.body.community_name
    })

    User.find({ username: newUser.username })
      .lean()
      .then(item => {
        if (item.length > 0) {
          console.log('Username already exists')
          res.redirect('/sign_up?error=1')
        } else {
          User.find({ email: newUser.email })
            .lean()
            .then(item => {
              if (item.length > 0) {
                console.log('email is already registered')
                res.redirect('/sign_up?error=2')
              } else {
                newUser
                  .save()
                  .then(console.log('New user created'))
                  .catch(err => console.log('Error when creating user:', err))
                res.redirect('/sign_in')
              }
            })
        }
      })
  })

app.get('/sign_out', (req, res) => {
  req.session.logged_in = false // make sure all session variables are nullified
  req.session.username = null
  req.session.type = null
  console.log('Logging out...')
  res.redirect('/')
})

app.route('/testUpdateProfile').post(async function (req, res) {
  await User.updateOne(
    {
      username: req.body.username // enter which user
    },
    {
      $set: {
        // set new variable
        community_name: req.body.community_name
      }
    }
  )
  const { username, community_name } = req.body
  const user = await User.findOne({ username }).lean()
  req.session.community_name = user.community_name
  // console.log("New community name input: "+community_name)
  console.log('New community name set: ' + req.session.community_name)
  res.redirect('/dashboard')
})

//return json of all non-admin users
app.get('/getUsers', function (req, res) {
  User.find({
    type: 'User',
    community_name: 'Parkview'
  })
    .lean()
    .then(item => {
      res.json(item)
    })
})

// URL handlers
app.get('/', function (req, res) {
  res.render('index', { title: 'Hestia' })
})
app.get('/user', function (req, res) {
  res.render('user', { title: 'Hestia' })
})
app.get('/dashboard', function (req, res) {
  if (req.session.logged_in) {
    console.log(
      'Accessing dashboard while already logged in, current user: ' +
        req.session.username
    )

    if (req.session.type == 'Admin') {
      //ADMIN VIEW
      User.find({
        //find user json where every user is in the same community as the admin
        type: 'User',
        community_name: req.session.community_name
      })
        .lean()
        .then(items => {
          res.render('dashboard', {
            title: 'Dashboard',
            logged_in: req.session.logged_in,
            username: req.session.username,
            user_type: req.session.type,
            community_name: req.session.community_name,
            UsersJson: items,
            isAdmin: true
          })
        })
    } else {
      //USER VIEW
      res.render('dashboard', {
        title: 'Dashboard',
        logged_in: req.session.logged_in,
        username: req.session.username,
        user_type: req.session.type,
        community_name: req.session.community_name
      })
    }
  } else {
    console.log('Not logged in, redirecting')
    res.redirect('/sign_in')
  }
})

app.listen(port, () =>
  console.log(`Server listening on http://localhost:${port}`)
)
