import express from 'express'
import cors from 'cors'
import * as authenticate from './controllers/authenticate.js'
const app = express()
app.use(cors());

app.get('/login', authenticate.control_login_authorize);

app.get('/callback', authenticate.control_login_callback);

app.get('/playlists', authenticate.playlists);

app.get('/tracks', authenticate.tracks);

app.delete('/remove_tracks', authenticate.remove_tracks);

app.get('/auth/token', authenticate.get_token);

app.listen(8000, () => {
  console.log('server started')
})


