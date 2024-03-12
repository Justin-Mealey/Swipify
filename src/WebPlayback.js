import React, { useState, useEffect } from 'react';
import './WebPlayback.css';
import { pre_webplayer, transferPlayback, play_playlist } from './pre_webplayer.js';

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

    useEffect(() => {
        if (player) {
            return;
        }
        pre_webplayer(props, player, setPlayer, setTrack, setActive, setDeviceId, setPaused, setCounter);
    }, [props.token]);

    // This function transfers active playback to the Spotify session in the browser
    useEffect(() => {
        transferPlayback(props, deviceId);
    }, [deviceId])

    useEffect(() => {
        play_playlist(props, setGotTracks, setTrack, deviceId);
    }, [deviceId, props.token]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if (player) {
                player.disconnect();
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Cleanup function to remove event listener
        return () => {
            handleBeforeUnload();
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [player]);

    const handleClick = (action) => {
        if (!player) return;
        switch (action) {
            case 'remove':
                let updatedTrackToRemove = [...tracksToRemove];
                if (tracksToRemove[tracksToRemove.length - 1]?.id == current_track?.id) {
                    // Prevent from attempting to delete same song twice. 
                    break;
                }
                updatedTrackToRemove.push(current_track);
                setTracksToRemove(updatedTrackToRemove);
                // intentional fallthrough
            case 'keep':
                player.nextTrack();
                console.log("Counter ", counter);
                break;
            case 'undo':
                {
                    if (counter < 1) break;
                    
                    let updatedTrackToRemove = [...tracksToRemove];
                    const recentlyRemoved = updatedTrackToRemove.pop();

                    if (props.track_list[(counter - 1) % num_tracks] && props.track_list[(counter - 1) % num_tracks].id == recentlyRemoved?.id) {
                        setTracksToRemove(updatedTrackToRemove);
                    }

                    player.previousTrack();
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
        const response = await fetch('http://localhost:8000/remove_tracks?' + new URLSearchParams({
            playlist_id: props.playlist_id,
            track_ids: ids_to_remove
        }), { method: 'DELETE' });

        setTracksToRemove([]);
        setDeletionStatus("Changes confirmed.");
    }

    const playSong = async (track_id) => {
        const response = await fetch('http://localhost:8000/play_song?'+ new URLSearchParams({
            'id' : track_id
        }), { method: 'PUT' });
        if (response){
            console.log(response);
        }
    }

    useEffect(() => {
        // Define handleKeyPress inside useEffect or after handleClick if handleClick is outside useEffect
        const handleKeyPress = (event) => {
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

    console.log("Tracks ", props.track_list);

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
                        <ProgressBar current={counter} total={num_tracks} />

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
        borderColor: '#f0f8ff',
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
        textAlign: 'left',
        width: '100%',
        margin: 5
    }

    return (
        <div style={containerStyles}>
            <div style={fillerStyles}>
                <span style={labelStyles}>{/* {`${percent}%`} */}</span>
            </div>
            <div style={noAlign} className='deleted-tracks-list'>Progress: {current} / {total}</div>
        </div>
    );
};

