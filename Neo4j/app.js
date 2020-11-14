var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var neo4j = require('neo4j-driver');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

var driver = neo4j.driver('bolt://18.235.243.145:32868', neo4j.auth.basic('neo4j', 'sail-bather-waxes'));
var session = driver.session();
var session2 = driver.session();

app.get('/', function (req, res) {
    session
        .run('MATCH(n:Movie) RETURN n')
        .then(function (result) {
            var movieArr = [];
            result.records.forEach(function (record) {
                movieArr.push({
                    id: record._fields[0].identity.low,
                    title: record._fields[0].properties.title,
                    released: record._fields[0].properties.released
                });
            });

            res.render('index', {
                movies: movieArr
            });
        })
        .catch(function (err) {
            console.log(err);
        });
   // session.close();
});

app.post('/movie/add', function (req, res) {
    var title = req.body.title;
    var released = req.body.released;

    session2
        .run('CREATE(n:Movie {title:{titleParam},year:{releasedParam}}) RETURN n.title', { titleParam: title, releasedParam: released })
        .then(function (result) {
            res.redirect('/');
           // session2.close();
        })
        .catch(function (err) {
            console.log(err);
        });

        res.redirect('/');
});

app.listen(3000);
console.log('Server Started on Port 3000');

module.exports = app;