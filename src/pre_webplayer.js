export const pre_webplayer = async (props, player, setPlayer, setTrack, setActive, setDeviceId, setPaused, setCounter) => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);
    window.onSpotifyWebPlaybackSDKReady = () => {
        player = new window.Spotify.Player({
            name: 'Swipify',
            getOAuthToken: cb => { cb(props.token); },
            volume: 0.5
        });
        setPlayer(player);
        player.addListener('ready', ({ device_id }) => {
            console.log('Ready with Device ID', device_id);
            setDeviceId(device_id);
        });

        player.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });

        player.addListener('player_state_changed', (state => {

            if (!state) {
                return;
            }
            const current_track = state.track_window.current_track;
            const ids = props.track_list.map((track) => track.id);

            setTrack(current_track);
            setCounter(ids.indexOf(current_track.id));
            setPaused(state.paused);

            player.getCurrentState().then(state => {
                (!state) ? setActive(false) : setActive(true)
            });

        }));
        player.connect();
    };
}
// This function transfers active playback to the Spotify session in the browser
export const transferPlayback = async (props, deviceId) => {
    if (!deviceId) {
        return;
    }
    await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + props.token
        },
        body: JSON.stringify({
            device_ids: [
                deviceId
            ],
            play: true
        })
    });
    console.log("second");
}
export const play_playlist = async (props, setGotTracks, setTrack, deviceId) => {
    const track_uris = props.track_list.map(track => track.uri);
    if (deviceId) {
        await fetch(`https://api.spotify.com/v1/me/player/shuffle?state=false?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${props.token}`
            },
            body: JSON.stringify({
                uris: track_uris,
                offset: { position: 0 }
            })
        })
            .then(response => response.json())
            .then(data => console.log('Playing playlist:', data))
            .catch(error => console.error('Error playing playlist:', error));
    }
    if (deviceId) {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${props.token}`
            },
            body: JSON.stringify({
                uris: track_uris,
                offset: { position: 0 }
            })
        })
            .then(response => response.json())
            .then(data => console.log('Playing playlist:', data))
            .catch(error => console.error('Error playing playlist:', error));
    }
    setGotTracks(true);
    setTrack(props.track_list[0]);
    console.log("third");
}


