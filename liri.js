//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//========INITIALIZE ENVIRONMENT====================
require("dotenv").config();
var keys = require('./keys.js');
var request = require('request');
var twitter = require('twitter');
var Spotify = require('node-spotify-api');
var fs = require('fs');
var tweetsArray = [];
var defaultMovie = "Mr. Nobody";
var defaultSong = "The Sign";
var omdbKey = 'b8caf550'
//console.log(keys)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var inquirer = require("inquirer");
//Using the inquirer npm to control what is asked for opposed to the user typing something in that doesn't match what I want to do
//The inquirer has multiple choices and if statements that will run varios functions based on the users choices and inputs
inquirer
    .prompt([
        {
            type: "list",
            message: "What do you want to do?",
            choices: ["See your last 20 tweets?", "Get information about a favorite song?", "Get information about a favorite movie?", "Do something?"],
            name: "exe"
        }
    ])
    .then(function (inquirerResponse) {
        if (inquirerResponse.exe === "Get information about a favorite song?") {
            inquirer
                .prompt([
                    {
                        type: "input",
                        message: "What song?",
                        name: "song"
                    }
                ])
                .then(function (spotifyresponse) {
                    spotifyThis(spotifyresponse.song)
                });

        }
        if (inquirerResponse.exe === "Get information about a favorite movie?") {
            inquirer.prompt([
                {
                    type: "input",
                    message: "What movie?",
                    name: "movie"
                }
            ])
                .then(function (movieresponse) {
                    if (movieresponse.movie == '') {
                        omdbdefault()
                    } else {
                        omdbData(movieresponse.movie)
                    }
                });
        }
        if (inquirerResponse.exe === "See your last 20 tweets?") {
            tweets();
        }
        if (inquirerResponse.exe === "Do something?") {
            doSomething();
        }
    });

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function tweets() {
    //Enables me to call the client below while using all of my personal keys from my .env file
    var client = new twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
        access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
    });
    //Using documentation from the npm website, the format for calling this information is below.  I am calling for the last 20.
    var params = { screen_name: 'Mark44869946', count: 20, exclude_replies: true, trim_user: true };
    client.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            //console.log(tweets);
            tweetsArray = tweets;   //putting tweets into an empty array

            for (i = 0; i < tweetsArray.length; i++) {  //for loop to display all the tweets, I only have 1 at this point, puts them in format below
                console.log("Created at: " + tweetsArray[i].created_at);
                console.log("Text: " + tweetsArray[i].text);
                console.log('--------------------------------------');
                var date = tweetsArray[i].created_at;
                //adding the tweet action to a log with the parameters below, had to use appendFileSync because without
                //I was getting errors in the terminal
                fs.appendFileSync('log.txt', "@Mark44869946: " + tweetsArray[i].text + " Created At: " + date.substring(0, 19));
                fs.appendFileSync('log.txt', "-----------------------");
            }
        } else {
            console.log(error);
        }
    });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function spotifyThis(song) {
//Enables me to call the client below while using all of my personal keys from my .env file
    var spotify = new Spotify({
        id: process.env.SPOTIFY_ID,
        secret: process.env.SPOTIFY_SECRET
    });

    //If user has not specified a song , default to "The Sign" by Ace of Base
    if (song === "") {
        song = defaultSong;
    }

    spotify.search({ type: 'track', query: song }, function (err, data) {
        if (err) {
            console.log('Error occurred: ' + err);
            return;
        }
//console logs the song data for the user to see and then updates the log.txt file with the particular song information
        var song = data.tracks.items[0];
        console.log("------Artist-----");
        for (i = 0; i < song.artists.length; i++) {
            console.log(song.artists[i].name);
        }
        console.log("------Title-----");
        console.log(song.name);
        console.log("-------Preview Link-----");
        if (song.preview_url == null) {
            console.log("No link can be provided at this time.");
        } else {
            console.log(song.preview_url);
        }
        console.log("-------Album-----");
        console.log(song.album.name);
        fs.appendFileSync('log.txt', song.artists[0].name + " | ");
        fs.appendFileSync('log.txt', song.name+ " | ");
        fs.appendFileSync('log.txt', song.preview_url+ " | ");
        fs.appendFileSync('log.txt', song.album.name+ " | ");
        fs.appendFileSync('log.txt', "-----------------------");
    });
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function omdbData(movie) {
//OMDB request below using my key and returns the information in a format that needs to be proper so that if console
//logged, can be easily read, then updates the lox.txt file
    var omdbURL = 'http://www.omdbapi.com/?t=' + movie + '&plot=short&tomatoes=true&apikey=' + omdbKey;
    request(omdbURL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var body = JSON.parse(body);

            console.log("Title: " + body.Title);
            console.log("Release Year: " + body.Year);
            console.log("IMdB Rating: " + body.imdbRating);
            console.log("Country: " + body.Country);
            console.log("Language: " + body.Language);
            console.log("Plot: " + body.Plot);
            console.log("Actors: " + body.Actors);
            console.log("Rotten Tomatoes Rating: " + body.tomatoRating);
            console.log("Rotten Tomatoes URL: " + body.tomatoURL);

            fs.appendFileSync('log.txt', "Title: " + body.Title+ " | ");
            fs.appendFileSync('log.txt', "Release Year: " + body.Year+ " | ");
            fs.appendFileSync('log.txt', "IMdB Rating: " + body.imdbRating+ " | ");
            fs.appendFileSync('log.txt', "Rotten Tomatoes Rating: " + body.tomatoRating+ " | ");
            fs.appendFileSync('log.txt', "Country: " + body.Country+ " | ");
            fs.appendFileSync('log.txt', "Language: " + body.Language+ " | ");
            fs.appendFileSync('log.txt', "Plot: " + body.Plot+ " | ");
            fs.appendFileSync('log.txt', "Actors: " + body.Actors+ " | ");
        }
    });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function omdbdefault(movie) {
//if no movie is entered, it defaults to "Mr.Nobody"
    var omdbURL = 'http://www.omdbapi.com/?t=' + defaultMovie + '&plot=short&tomatoes=true&apikey=' + omdbKey;
    request(omdbURL, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var body = JSON.parse(body);

            console.log("Title: " + body.Title);
            console.log("Release Year: " + body.Year);
            console.log("IMdB Rating: " + body.imdbRating);
            console.log("Rotten Tomatoes Rating: " + body.tomatoRating);
            console.log("Country: " + body.Country);
            console.log("Language: " + body.Language);
            console.log("Plot: " + body.Plot);
            console.log("Actors: " + body.Actors);

            fs.appendFileSync('log.txt', "Title: " + body.Title+ " | ");
            fs.appendFileSync('log.txt', "Release Year: " + body.Year+ " | ");
            fs.appendFileSync('log.txt', "IMdB Rating: " + body.imdbRating+ " | ");
            fs.appendFileSync('log.txt', "Rotten Tomatoes Rating: " + body.tomatoRating+ " | ");
            fs.appendFileSync('log.txt', "Country: " + body.Country+ " | ");
            fs.appendFileSync('log.txt', "Language: " + body.Language+ " | ");
            fs.appendFileSync('log.txt', "Plot: " + body.Plot+ " | ");
            fs.appendFileSync('log.txt', "Actors: " + body.Actors+ " | ");
        }
    });
};
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function doSomething() {
//do something is the last choice and it gets spotify data from a random.txt file for the song I want it that way
    fs.readFile('random.txt', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
//makes an array from the txt file split at each comma and from there I can choose my array index to run the spotify function
        var dataArr = data.split(',');
        //console.log(dataArr);
        spotifyThis(dataArr[1]);
    })
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////