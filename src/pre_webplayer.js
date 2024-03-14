export const pre_webplayer = async (props, player, setPlayer, setTrack, setActive, setDeviceId, setPaused) => {
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

export const play_playlist = async (props, setGotTracks, setTrack, deviceId, counter, setPaused, is_paused) => {
    const track_uris = props.track_list.map(track => track.uri);
    console.log("counter", counter);
    console.log("track_uris", track_uris);
    if (deviceId) {
        await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': "Bearer " + props.token,
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                uris: [track_uris[counter]],
                offset: { position: 0 },
            }),
        })
            .then(response => response.json())
            .then(data => console.log('Playing playlist:', data))
            .catch(error => console.error('Error playing playlist:', error));
    }
    console.log("Current track ", props.track_list[counter]);
    setGotTracks(true);
    setTrack(props.track_list[counter]);
    setPaused(false);
    console.log("third");
}


