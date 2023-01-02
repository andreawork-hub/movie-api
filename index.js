const express = require('express');
const bodyParser = require('body-parser');

const uuid = require('uuid');
const morgan = require('morgan');
const app = express();

const { check, validationResult } = require('express-validator');

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;


mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

app.use(express.static('public'));
app.use(morgan('common'));

app.use(bodyParser.urlencoded({
    extended: true
}));
const cors = require('cors');
// app.use(cors());

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
            let message = 'The CORS policy for this application doesn\'t allow access from origin ' + origin;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    }
}));

let auth = require('./auth')(app);
//ensures that Express is available in “auth.js” file as well
const passport = require('passport');
//require the Passport module and import the “passport.js” file
require('./passport');


app.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send('Welcome to myFlix!');
});

//Add a user
/* Validation logic here for request
- you can either use a chain of methods like .not().isEmpty() which means 
"opposite of isEmpty" in plain english "is not empty"
- or use .isLength({min: 5}) which means
minimum value of 5 characters are only allowed*/
app.post('/users',
    [
        check('Username', 'Username is required').isLength({ min: 5 }),
        check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
        check('Password', 'Password is required').not().isEmpty(),
        check('Email', 'Email does not appear to be valid').isEmail()
    ], (req, res) => {
        let errors = validationResult(req); // check the validation object for errors
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        let hashedPassword = Users.hashPassword(req.body.Password);
        Users.findOne({ UserName: req.body.UserName }) // Search to see if a user with the requested username already exists
            .then((user) => {
                if (user) { //If the user is found, send a response that it already exists
                    return res.status(400).send(req.body.UserName + 'already exists');
                } else {
                    Users
                        .create({
                            UserName: req.body.UserName,
                            Password: hashedPassword,
                            Email: req.body.Email,
                            Birth_Date: req.body.Birth_Date
                        })
                        .then((user) => { res.status(201).json(user) })
                        .catch((error) => {
                            console.error(error);
                            res.status(500).send('Error: ' + error);
                        });
                }
            })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            });
    });

// Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.find()
        .then((users) => {
            res.status(201).json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});
// Get a user by username
app.get('/users/:UserName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ UserName: req.params.UserName })
        .then((user) => {
            res.json(user);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});
// Get a user by username and update
app.put('/users/:UserName', [
    check('UserName', 'Username is required').isLength({ min: 5 }),
    check('UserName', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
        { UserName: req.params.UserName },
        {
            $set: {
                UserName: req.body.UserName,
                Password: hashedPassword,
                Email: req.body.Email,
                Birth_Date: req.body.Birth_Date
            },
        },
        { new: true }, /* This line makes sure that the updated document is returned*/
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});

// Add a movie to a user's list of favorites
app.post('/users/:UserName/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ UserName: req.params.UserName }, {
        $push: { FavoriteMovies: req.params.MovieID }
    },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});


// Remove a movie to a user's list of favorites
app.delete('/users/:UserName/movies/:MovieID', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ UserName: req.params.UserName }, {
        $pull: { FavoriteMovies: req.params.MovieID }
    },
        { new: true },
        (err, updatedUser) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error: ' + err);
            } else {
                res.json(updatedUser);
            }
        });
});

// Delete a user by username
app.delete('/users/:UserName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndRemove({ UserName: req.params.UserName })
        .then((user) => {
            if (!user) {
                res.status(400).send(req.params.UserName + ' was not found');
            } else {
                res.status(200).send(req.params.UserName + ' was deleted.');
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

// Get all movies 
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
        .then((movies) => {
            res.status(201).json(movies);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error:' + err);
        });
});

// Get movie by Title 
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ Title: req.params.Title })
        .then((movie) => {
            res.json(movie);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error:' + err);
        });
});

// Get movie by Genre
app.get('/movies/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Name })
        .then((movies) => {
            res.json(movies.Genre);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error:' + err);
        });
});

// Get movie by Director Name 
app.get('/movies/directors/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name })
        .then((movies) => {
            res.json(movies.Director);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error:' + err);
        });
});

app.get('/documentation', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.sendFile('public/documentation.html', { root: __dirname });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})


// listen for requests 
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
    console.log('Listening on Port ' + port);
});
