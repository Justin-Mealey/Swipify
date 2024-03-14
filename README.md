# Setup

```
git clone https://github.com/christiandsol/Swipify

```
From here, go into the directory that you cloned. 
For code to be able to run, you will need to run npm install and create a .env file in your root directory with:
REDIRECT_URI = 'http://localhost:8000/callback'
CLIENT_SECRET = ''
CLIENT_ID = ''
ACCESS_TOKEN = ''
REFRESH_TOKEN = ''
USER_ID = null

You will need to fill your CLIENT SECRET and CLIENT ID with what is provided when you create an app on the spotify developer dashboard.
REDIRECT_URI can be however you set it. For ease of use purposes, you can use 

REDIRECT_URI = http://localhost:8000/callback
CLIENT_SECRET = 4ec32e4ce4c1478293324b3362550857
BASE_URL = https://api.spotify.com/v1
AUTH_URL = https://accounts.spotify.com/authorize
CLIENT_ID = 002f6e5dac5345d1be58e8aba4fb585f
ACCESS_TOKEN = '' 
REFRESH_TOKEN = '' 
USER_ID = null

