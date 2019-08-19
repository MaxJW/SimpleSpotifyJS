//Simple Spotify JS Authenticator
//I used this in my MagicMirror web implementation to connect to spotify using the Implicit Grant authorization flow.
//Keeping this code here if it happens to be useful to anyone else!
//Example HTML call below:
/*
function spotifyRefresh() { //Function created in order to refresh the currently playing song from the user
    $('#spotify').startSpotify({
        clientID: spot_client_id, //Client_ID to pass in
        albumImgTarget: '#spot-img', //Album image target
        songTitleTarget: '#spot-title', //Song title target
        songArtistTarget: '#spot-artist', //Song artist target
        success: function () {
            $('#spotify').show(); //Show the div if a successful connection
        },
        error: function () {
            console.log("ERROR: Spotify was unable to load."); //ERROR if there was a problem!
            $('#spotify').hide();
        }
    });
    setTimeout(spotifyRefresh, 10000); //Refresh every 10 seconds
}

$(document).ready(function () {
    spotifyRefresh(); //Call once the page has loaded
});
*/
(function ($) {
    $.fn.startSpotify = function (options) {
        var defaults = {
            authorizeEndpoint: 'https://accounts.spotify.com/authorize',
            apiEndpoint: 'https://api.spotify.com/v1/me/player', //May need to change for different scope requests!
            redirectURI: 'https://YOUR-URL-HERE.com/',  //URL to redirect to after authorization
            clientID: null, //Client ID from your Spotify Application
            access_token: null, //Keep as null, will be updated with the 'authorize()' function below
            scope: 'SPOTIFY-SCOPES-HERE',   //List of available scopes - https://developer.spotify.com/documentation/general/guides/scopes/
            albumImgTarget: null,   //Target to set the image source of for the received artwork
            songTitleTarget: null,  //Target to set the text of for song title
            songArtistTarget: null, //Target to set the text of for the artist name
            success: function () { },
            error: function (message) { }
        }
        var plugin = this;
        var el = $(this);
        plugin.settings = {}
        plugin.settings = $.extend({}, defaults, options); //Extend settings with what is provided in your html code
        var s = plugin.settings;

        //FORCE_UPDATE will force a re-authorization in case of any problems with the current code
        //Load authorization window to verify the user wishes to connect to your application
        var authorize = function (FORCE_UPDATE) {
            var authorizeURL = s.authorizeEndpoint + '?client_id=' + s.clientID + '&response_type=token' + '&redirect_uri=' + encodeURIComponent(s.redirectURI) + '&scope=' + encodeURIComponent(s.scope);
            var curr_url = window.location.href;

            if (!curr_url.includes('access_token') || FORCE_UPDATE) {
                window.location.replace(authorizeURL);
            } else {
                var acc = curr_url.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1];    //Get access_token from the url using Regex
            }
            return acc;
        }

        //Get response from spotify request, in this case getting the album artwork, song name, and artist and setting them to the image and text elements provided above
        var getSpotifyData = function () {
            $.ajax({
                url: s.apiEndpoint,
                headers: {
                    'Authorization': 'Bearer ' + s.access_token
                },
                success: function (response) {  //On success, set the targets appropriately
                    console.log(response);
                    if (response !== undefined) {
                        $(s.albumImgTarget).attr('src', response.item.album.images[1].url);
                        $(s.songTitleTarget).text(response.item.name);
                        $(s.songArtistTarget).text(response.item.artists[0].name);
                    }
                },
                error: function (response) {
                    console.log("Spotify Token Expired: Refreshing...");
                    authorize(true);
                }
            });
        }

        //Start of executed code
        //If there is no current token, run an update
        if (s.access_token == null) {
            s.access_token = authorize(false);
        }
        getSpotifyData(); //Get data from server
    }
})(jQuery);