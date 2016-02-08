var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var request = require('request');
var moment = require('moment');
//TODO logger


var APIKEY = '6MKqSwCKBOH3McxE7NVaL5CGGFvROvhXYHXbNLfC';  //TODO environment variable
var baseURL = 'https://api.nasa.gov/planetary/apod' ;

/* GET home page. */
router.get('/', homepage);


function homepage(req, res) {
  res.render('index', { title: 'ASTROPIX' });
}

//MUST have a body-parser to get POST data.
//(Unlike GET requests, which can be extracted from body.query)
parser = bodyParser.json();

router.post('/fetch_picture', parser, function fetch_picture(req, res) {

  var today = "today_picture";
  var random = "random_picture";

  if (req.body[today] ) {
    apodRequest(false, function() {
      if (apodJSON.hasOwnProperty("copyright")) { apodJSON.copyright = "Image credit and copyright " + apodJSON.copyright;}
      res.render('image', apodJSON);
    });
  }

  else if (req.body[random]) {
    apodRequest(true, function() {
      res.render('image', apodJSON);
    });
  }

  else {
    res.status(404).send("Unknown option");
  }

});

var apodJSON;


function apodRequest(random, callback) {

  var queryParam = {};

  if (random) {
    console.log("random picture request");
   // var randomDate = randomDateString();
    queryParam = { "api_key" : APIKEY,
      "date" :randomDateString() };

  }
  else {
    queryParam = { 'api_key' : APIKEY };

  }

  request({uri :baseURL, qs: queryParam} , function(e, r, b, cb){
    apodJSONReply(e, r, b, callback);
  });

}


function apodJSONReply(error, response, body, callback){
  console.log(response);

  if (!error && response.statusCode == 200){

    apodJSON = JSON.parse(body);
    //description =  apodJSON['explanation'];

    callback();
  }

  else {
    //TODO better error handling
    console.log("Error in JSON request " + error );
  }

}

//Create a random date string between start of APOD service and today.
function randomDateString(){

  //APOD started on June 16th, 1995. Select a random date between then and today.
  var today = moment();
  var APODstart = moment('1995-06-16');

  var todayUnix = today.valueOf();
  var APODstartUnix = APODstart.valueOf();
  var delta = todayUnix - APODstartUnix;

  var offset = Math.floor((Math.random() * delta ));
  var randomUnix = APODstartUnix + offset;

  var randomDate = moment(randomUnix) //unix time generated

  var stringRandomDate = randomDate.format('YYYY-MM-DD')

  return stringRandomDate;

}


module.exports = router;
