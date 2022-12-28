const express = require('express');
const bodyParser = require('body-parser');

const uuid = require('uuid');
const morgan = require('morgan');
const app = express();

const mongoose = require('mongoose');
const Models = require('./models.js');

const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;


mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());

app.use(express.static('public'));
app.use(morgan('common'));

app.use(bodyParser.urlencoded({
    extended: true
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
app.post('/users', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOne({ UserName: req.body.UserName })
        .then((user) => {
            if (user) {
                return res.status(400).send(req.body.UserName + 'already exists');
            } else {
                Users
                    .create({
                        UserName: req.body.UserName,
                        Password: req.body.Password,
                        Email: req.body.Email,
                        Birth_Date: req.body.Birth_Date
                    })
                    .then((user) => { res.status(201).json(user) })
                    .catch((error) => {
                        console.error(error);
                        res.status(500).send('Error: ' + error);
                    })
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
app.put('/users/:UserName', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate(
        { UserName: req.params.UserName },
        {
            $set: {
                UserName: req.body.UserName,
                Password: req.body.Password,
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
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
}); 
