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
    const [counter, setCounter] = useState(0);
    const num_tracks = props.track_list.length;
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

    useEffect( () => {
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
                if (tracksToRemove[tracksToRemove.length - 1]?.id == current_track?.id){
                    break;
                }
                updatedTrackToRemove.push(current_track);
                setTracksToRemove(updatedTrackToRemove);
            case 'keep':
                player.nextTrack();
                setCounter(counter + 1);
                break;
            case 'undo':
                {
                player.previousTrack();                
                let updatedTrackToRemove = [...tracksToRemove];
                let recentlyRemoved = updatedTrackToRemove.pop();

                if (counter > 0 && props.track_list[(counter - 1) % num_tracks].id == recentlyRemoved?.id){
                    setTracksToRemove(updatedTrackToRemove);
                }

                if (counter <= 0) { //cannot undo at the start
                    break;
                }
                setCounter(counter - 1);
                }
                break;
            case 'toggle':
                player.togglePlay();
                break;
            default:
                break;
        }
    };

    
    const confirmDelete = async () => {
        // DELETED 

        setDeletionStatus("Deleting...");
        
        let ids_to_remove = tracksToRemove.map((track) => track.id);
        console.log('happened')
        const response = await fetch('http://localhost:8000/remove_tracks?' + new URLSearchParams({
            playlist_id: props.playlist_id,
            track_ids: ids_to_remove
        }), {method: 'DELETE'});        

        setTracksToRemove([]);
        setDeletionStatus("Changes confirmed.");
    }

    useEffect(() => {
        // Define handleKeyPress inside useEffect or after handleClick if handleClick is outside useEffect
        const handleKeyPress = (event) => {
            console.log(event.key); // Add this line to log the key that's being pressed
            switch (event.key) {
                case 'ArrowRight':
                    handleClick('keep');
                    break;
                case 'ArrowLeft':
                    handleClick('undo'); 
                    break;
                case 'Backspace':
                    handleClick('remove');
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
        <div className='sidebar'>
            <div className='deleted-tracks-list'>
                <h2>Deleted Tracks</h2>
                {tracksToRemove.map((item, index) => (
                    <div key={index} className="deleted-track">
                        <div className="track-container">
                            {/* <button className="remove-track-btn"> 
                                x
                            </button> */}
                            <span>{item.name} - {item.artists[0].name}</span>
                        </div>
                    </div>
                ))}
                {tracksToRemove.length > 0 && (
                    <button className='confirm-btn' onClick={confirmDelete}>Confirm</button>
                )}
                </div>
            <div>
                {deletionStatus}
            </div>
        </div>
            <select>
            {props.track_list.map((item) => <option key={item.id}>{item.name}</option>)}
            </select>
            <div className="container">
                <div className="main-wrapper">
                    <div className="playlist-name">{props.playlist_name}</div>
                    <img src={current_track?.album?.images[0]?.url} className="album-img" alt="" />
                    <div className="now-playing">
                        <div className="now-playing__name">{current_track?.name}</div>
                        <div className="now-playing__artist">{current_track?.artists[0]?.name}</div>
                        <button className="spotify-btn" onClick={() => handleClick('remove')}>
                            <i className="fas fa-trash"></i> 
                        </button>
                        <button className='spotify-btn' onClick={() => handleClick('undo')}>
                            <i className="fas fa-undo"></i> 
                        </button>
                        <button className="spotify-btn" onClick={() => handleClick('toggle')}>
                            {is_paused ? <i className="fas fa-play"></i> : <i className="fas fa-pause"></i>}
                        </button>
                        <button className="spotify-btn" onClick={() => handleClick('keep')}>
                            <i className="fas fa-arrow-right"></i> 
                        </button>
                        <ProgressBar current={counter} total={num_tracks}/>

                    </div>
                </div>
            </div>
        </>
    );
};


const ProgressBar = (props) => {
    let { current, total } = props;
    current > total ? current = total : null; 
    let percent = (current) / total * 100;

    const containerStyles = {
        border: 'solid',
        height: 20,
        width: '100%',
        backgroundColor: "#212121",
        margin: '50px 0px',
        borderRadius: 20,
        borderColor : '#f0f8ff',
    }

    const fillerStyles = {
        height: '100%',
        width: `${percent}%`,
        backgroundColor: '#f0f8ff',
        textAlign: 'right',
        borderRadius: 'inherit'
    }

    const labelStyles = {
        padding: 5,
        color: '#212121',
        fontWeight: 'bold'
    }

    const noAlign = {
        textAlign : 'left',
        width: '100%',
        margin: 5
    }

    return (
        <div style={containerStyles}>
        <div style={fillerStyles}>
            <span style={labelStyles}>{`${percent}%`}</span>
        </div>
        <div style={noAlign} className='deleted-tracks-list'>Progress: {current} / {total}</div>
        </div>
    );
};

