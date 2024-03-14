import querystring from 'querystring';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Initialization
const REDIRECT_URI = process.env.REDIRECT_URI; 
const CLIENT_SECRET = process.env.CLIENT_SECRET;  
const CLIENT_ID = process.env.CLIENT_ID; 
let ACCESS_TOKEN = process.env.ACCESS_TOKEN;
let REFRESH_TOKEN = process.env.REFRESH_TOKEN;
let USER_ID = process.env.USER_ID;
let PLAYLIST_DATA;

export const control_login_authorize = function(req, res) {
    // Authorizes the user with the spotify api when they login with spotify. 

    const state = '798873302492668522416472228';
    var scope = 'user-read-private user-read-email streaming playlist-modify-private playlist-modify-public playlist-read-private';
    var redirectUrl = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scope,
      redirect_uri: REDIRECT_URI,
      state: state
    });
    res.redirect(redirectUrl);  
};


export const control_login_callback = async function(req, res) {
    // After authorization, update backend data and redirect user to main page of app. 

    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.query.state || null;
    const error = req.query.error || null;
    
    if (error) {
        console.log('Error: ', error);
        res.send('There was an error during the authentication');
    } else {
        // console.log('Code: ', code);
        const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
            code: code,
            redirect_uri: REDIRECT_URI,
            grant_type: 'authorization_code'
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
            }
        });
        ACCESS_TOKEN = response.data.access_token;
        REFRESH_TOKEN= response.data.refresh_token;
        const profile = await getProfile(ACCESS_TOKEN);
        USER_ID= profile.id;
        await get_playlists();
        res.redirect('http://localhost:3000');
    }
};

export async function getProfile(access_token) {
    // Gets profile data from spotify api. 

    const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': 'Bearer ' + access_token
        }
    });
    console.log('Profile: ', response.data);
    return response.data;
}

export const obtain_tokens = async (req, res) => {
    // Retrieves access tokens and refresh tokens from api and updates backend values. 

    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.query.state || null;
    const error = req.query.error || null;
    
    if (error) {
        console.log('Error: ', error);
        res.send('There was an error during the authentication');
    } else {
        console.log('Code: ', code);
        const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
        }), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
        }
        });
        console.log('Response: ', response.data);
        ACCESS_TOKEN= response.data.access_token;
        console.log('Access token: ', ACCESS_TOKEN);
        REFRESH_TOKEN= response.data.refresh_token;
        const profile = await getProfile(ACCESS_TOKEN);
        USER_ID= profile.id;
        res.redirect('localhost:3000');
    }
}

export const get_token = async (req,res) => {
    // Gets current user access token from backend. 

    console.log('Access token: ', ACCESS_TOKEN);
    res.json({
        access_token: ACCESS_TOKEN
    });
}

export const playlists = async (req, res) => {
    // Function to be called from frontend to get all playlists. 

    try{
        let playlists = await get_playlists();
        console.log('Playlists amount displayed, total: ', playlists.length);
        res.json(playlists)
    }
    catch{
        res.send('no playlists? or not logged in')
    }
}

export const tracks = async (req, res) => {
    // Function to be called from frontend to get tracks from playlist. 

    try{
        let playlist_id = req.query.playlist_id;
        let data = await get_tracks_from_playlist(playlist_id);
        res.json(data);
    } catch (error){
        console.log(error)
        res.send('no playlists? or not logged in')
    }
}

export const remove_tracks = async (req, res) => {
    // Function to be called from frontend to remove tracks from playlist. 

    try{
        let idsToDelete = req.query.track_ids.split(',');
        let playlist_id = req.query.playlist_id;
        let response = await remove_tracks_from_playlist(playlist_id, idsToDelete);
        res.json(response.status);
    } 
    catch (error){
        console.log("ERROR DELETING TRACKS: " + error);
    }
}


/*
BEGIN API PLAYLIST EDITING FUNCTIONS
*/


async function get_playlists() {
    // Returns a full list of playlist objects owned by the user, and sets global variable PLAYLIST_DATA.
    
    let playlists = [];
    let queryString = 'https://api.spotify.com/v1/me/playlists';

    while (queryString){
        const response = await axios.get(queryString, {
            params: {
                'limit': 50,
                'offset': 0
            },
            headers: { 
                'Authorization': 'Bearer ' + ACCESS_TOKEN
            }});

        playlists = playlists.concat(response.data.items);
        queryString = response.data.next;
    }
    
    let user_owned = playlists.filter((playlist) => playlist.owner.id == USER_ID);
    PLAYLIST_DATA =  user_owned.filter((playlist) => playlist.tracks.total > 0);
    return PLAYLIST_DATA;
}

async function get_tracks_from_playlist(playlist_id){
    // Returns an array of all track objects for a playlist, containing all their data, from the playlist given. 
    // Intended to be called by get_tracks_and_artists_from_playlist.

    let tracks = [];
    let queryString = 'https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks';

    while(queryString){
        const response = await axios.get(queryString, {
            params: {
                'market': 'US',
            },
            headers: {
                'Authorization': 'Bearer ' + ACCESS_TOKEN
            }
        });

        tracks = tracks.concat(response.data.items);
        queryString = response.data.next;
    }

    return tracks;
}

async function remove_tracks_from_playlist(playlist_id, trackids_to_remove){
    // Takes in an array of track_ids, and the playlist_id the track is meant to be removed from. 
    // Should be called with a list of track_ids from the front end, once the user confirms removal of the tracks. 
    // EX:
    // trackids_to_remove = ['2FDTHlrBguDzQkp7PVj16Q', '0GAyuCo975IHGxxiLKDufB'];
    // playlist_id = '60uTaRX0ZDG5tSW3PCYBVL';

    // Removes list of trackids from playlist by calling web api, and then updates 
    // the playlists data, including snapshot_id to allow further track removal. 

    let tracks_to_remove = trackids_to_remove.map((track_id) => ({"uri" : "spotify:track:" + track_id}));


    const playlist = PLAYLIST_DATA.find(obj => obj.id === playlist_id);

    const response = await axios.delete('https://api.spotify.com/v1/playlists/' + playlist_id + '/tracks', {
        headers: {
            'Authorization': 'Bearer ' + ACCESS_TOKEN,
            'Content-Type': 'application/json'
        }, data: {
            'tracks': tracks_to_remove,
            'snapshot_id': playlist.snapshot_id
    }});

    await get_playlists();  
    return response;
}
