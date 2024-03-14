# Setup
## Requirements
Spotify Premium
Spotify Developer Dashboard
Latest react version

## Getting the App

github link: https://github.com/christiandsol/Swipify

```
git clone https://github.com/christiandsol/Swipify
```
From here, go into the directory that you cloned. 
For code to be able to run, you will need to run npm install and create a .env file in your root directory.
You will need to fill your CLIENT SECRET and CLIENT ID with what is provided when you create an app on the spotify developer dashboard. 
This step is necessary for convenience, the only other way to do it would be for us to give every user of our application developer access. You will be able to create a 
spotify API account here https://developer.spotify.com/documentation/web-api at the top right corner after signing into your account. Then clicking on the top right again going to 
dashboard. From here you will create your application with a name and (IMPORTANT) the redirect URI being http://localhost:8000/callback

REDIRECT_URI can be however you set it. For ease of use purposes, you can use 
```
REDIRECT_URI = http://localhost:8000/callback
CLIENT_SECRET = REPLACE_WITH_YOUR_CLIENT_SECRET 
BASE_URL = https://api.spotify.com/v1
AUTH_URL = https://accounts.spotify.com/authorize
CLIENT_ID = REPLACE_WITH_YOUR_CLIENT_ID 
ACCESS_TOKEN = '' 
REFRESH_TOKEN = '' 
USER_ID = null
```

After including all these files, run npm install

```
npm install
```
Following, you can do
```
npm run dev
```
to run the backend and the frontend simultaneously

If you get an error with an explanation like:
(probably because the origin is strict EcmaScript Module, e. g. a module with javascript mimetype, a
'*mis' file, or a '*.is' file where the package.ison
contains !"type":
"module!').
Then you must ensure that you have the latest version of react installed, run:
```
npm install react@latest react-dom@latest
```

The spotify webplayer playback SDK from the spotify api has many issues including: 
- Faultiness if used in the non-latest version of google chrome
- Faultiness if using a public or non-private network
- Faultiness if having too many requests to the spotify api, when working with the 
    application, if you exceed a certain amount of requests by filtering by artists, 
    choosing a song from the dropdown, the webplayer can be faulty, if you don't spam the 
    page everything should work fine
