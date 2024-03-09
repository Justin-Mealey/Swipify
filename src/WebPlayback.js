import React, { useState, useEffect } from 'react';
import './WebPlayback.css';

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}

/**
 * 
 * @function WebPlayback
 * @functiondesc This component is responsible for the playback of 
 * the playlist in the browser. It uses the Spotify Web Playback SDK 
 * to play the playlist in the browser. 
 */
export default function WebPlayback(props) {
    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
    const [current_track, setTrack] = useState(track);
    const [deviceId, setDeviceId] = useState(null);
    const [gotTracks, setGotTracks] = useState(false);
    const [tracksToRemove, setTracksToRemove] = useState([]);
    const [deletionStatus, setDeletionStatus] = useState("");
    // console.log("Tracks", props.track_list);


    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
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
                setTrack(state.track_window.current_track);
                setPaused(state.paused);

                player.getCurrentState().then(state => {
                    (!state) ? setActive(false) : setActive(true)
                });

            }));
            player.connect();
        };
    }, [props.token]);

    // This function transfers active playback to the Spotify session in the browser
    useEffect(() => {
        async function transferPlayback() {
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
        }
        if (deviceId) {
            transferPlayback();
        }
    }, [deviceId])

    useEffect(() => {
        const track_uris = props.track_list.map(track => track.uri);
        if (deviceId) {
            fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
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
    }, [deviceId, props.token]);

    const handleClick = (action) => {
        if (!player) return;
        switch (action) {
            case 'remove':
                let updatedTrackToRemove = [...tracksToRemove];
                updatedTrackToRemove.push(current_track);
                setTracksToRemove(updatedTrackToRemove);
            case 'keep':
                player.nextTrack();
                break;
            case 'undo':
                player.previousTrack();
                // implement functional undo button stuff
                break;
            case 'toggle':
                player.togglePlay();
                break;
            default:
                break;
        }
    };


    const confirmDelete = () => {

        let ids_to_remove = tracksToRemove.map((track) => track.id);
        console.log(ids_to_remove);
        // ids_to_remove = [];

        setDeletionStatus("Deleting...");
        
        async function del_tracks(){
            console.log('happened')
            const response = await fetch('http://localhost:8000/remove_tracks?' + new URLSearchParams({
                playlist_id: props.playlist_id,
                track_ids: ids_to_remove
            }), {method: 'DELETE'});
            console.log(response)
            return response;
        }

        let response = del_tracks();
        console.log(response);

        

        
        setDeletionStatus("Changes confirmed.");
    }

    useEffect(() => {
        // Define handleKeyPress inside useEffect or after handleClick if handleClick is outside useEffect
        const handleKeyPress = (event) => {
            console.log(event.key); // Add this line to log the key that's being pressed
            switch (event.key) {
                case 'ArrowRight':
                    handleClick('next');
                    break;
                case 'ArrowLeft':
                    handleClick('undo'); // Ensure this maps correctly to your intended function
                    break;
                case 'Backspace':
                    handleClick('previous');
                    break;
                case ' ':
                    event.preventDefault();
                    handleClick('toggle');
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [current_track, handleClick]); // handleClick dependency is now valid

    if (!is_active || !gotTracks || !current_track) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <>
            <select>
            {props.track_list.map((item) => <option>{item.name}</option>)}
            </select>
            <div className="container">
                <div className="main-wrapper">
                    <div className="playlist-name">{props.playlist_name}</div>
                    <img src={current_track?.album?.images[0]?.url} className="album-img" alt="" />
                    <div className="now-playing">
                        <div className="now-playing__name">{current_track?.name}   {current_track?.id}</div>
                        <div className="now-playing__artist">{current_track?.artists[0]?.name}</div>
                        <button className="spotify-btn" onClick={() => handleClick('remove')}>
                            <i className="fas fa-trash"></i> {/* Replace "Remove" with a trash icon */}
                        </button>
                        <button className='spotify-btn' onClick={() => handleClick('undo')}>
                            <i className="fas fa-undo"></i> {/* Replace "Undo" with a backwards arrow */}
                        </button>
                        <button className="spotify-btn" onClick={() => handleClick('toggle')}>
                            {is_paused ? <i className="fas fa-play"></i> : <i className="fas fa-pause"></i>} {/* Play or Pause icon depending on is_paused */}
                        </button>
                        <button className="spotify-btn" onClick={() => handleClick('keep')}>
                            <i className="fas fa-arrow-right"></i> {/* Replace "Keep" with a right arrow */}
                        </button>

                        <button className='spotify-btn' onClick={confirmDelete}>DELETE</button>
                    </div>
                </div>
            </div>
        </>
    );
}
