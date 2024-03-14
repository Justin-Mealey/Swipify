import React, { useEffect, useState } from 'react'
import WebPlayback from './WebPlayback.js'
import { useLocation } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'




export default function Swipescreen({ token }) {
    const { state } = useLocation();
    const { playlist_id, name } = state;
    const [tracks, setTracks] = useState([null]);
    const [loading, setLoading] = useState(true);
    let artists = null;
    if (tracks[0]) {
        artists = tracks.map(({ track }) => track.artists);
    }
    let navigate = useNavigate();

    useEffect(() => {
        async function getToken() {
            const response = await fetch('http://localhost:8000/auth/token');
            const json = await response.json();
            console.log(json.access_token);
            if (!json.access_token) {
                navigate('/');
            }
        };
        async function getTracks(playlist_id) {
            const response = await fetch('http://localhost:8000/tracks?' + new URLSearchParams({
                playlist_id: playlist_id,
            }));
            const json = await response.json();
            setTracks(json);
            setLoading(false);
        }
        getToken();
        getTracks(playlist_id);

    }, [token]);
    if (loading) {
        return <div>Loading...</div>;
    }

    function handleFilter(filtered_tracks) {
        setTracks(filtered_tracks)
        console.log("filtered tracks: ", filtered_tracks)
    }

    return (
        <div className="screen-container">
            <div className="swipe-screen">
                {<WebPlayback token={token} track_list={tracks.map(item => item.track)} playlist_name={name} playlist_id={playlist_id} />}
            </div>
            <ArtistDropdown tracks={tracks} artists={artists} onFilter={handleFilter} />
        </div>
    );
}

//dropdown menu where a user can click on an artists and tracks will get filtered
function ArtistDropdown({ tracks, artists, onFilter }) {

    //const [selectedArtist, setSelectedArtist] = useState(null);
    function handleClick() { //only called if tracks and artist are valid
        //setSelectedArtist(artist)
        let id = document.getElementById("dropdown").value
        let filtered_tracks = sort_tracks_by_artist(tracks, artists, id)
        onFilter(filtered_tracks)
    }

    if (artists[0] && tracks[0]) { //1st elem will either be null (false) or 1st list/object (true)

        let flattened_artists = [].concat(...artists); //now just one long list of artist objects

        let seen_ids = [];
        let unique_artists = []

        for (let i = 0; i < flattened_artists.length; i++) {
            let artist = flattened_artists[i];
            if (!seen_ids.includes(artist.id)) {
                unique_artists.push(artist);
                seen_ids.push(artist.id);
            }
        }

        return (<>
            <select className="artistlist" id="dropdown" onInput={() => handleClick()}>
                {unique_artists.map((artist) =>
                    <option key={artist.id} value={artist.id}>
                        {artist.name}
                    </option>)}
            </select>
        </>)
    }
    else { //artists or tracks state still null right now
        return <div></div>
    }
}


function sort_tracks_by_artist(tracks, artists, artist_id) {
    // Given an array of track objects, puts all songs with artist of artist_id at the beginning of the array.
    // Returns the reordered list of tracks. 

    /* Implementation: say tracks 4, 7, and 18 have the artist
       tracks[0] <-> tracks[4], tracks[1] <-> tracks[7], tracks[2] <-> tracks[18]
    */

    let artist_ids = []
    for (let i = 0; i < artists.length; i++) { //artists is nested array, map inner array's artists to their id's
        let ids = artists[i].map((artist) => artist.id) //in 1st iter, ids = list of ids for artists in track 1
        artist_ids.push(ids)
    }
    //artist_ids looks like [ [drakeid, jcoleid], [travis scottid, dababyid,] ] for tracks 0 and 1

    let frontmost_index = 0
    let newtracks = [...tracks];
    for (let i = 0; i < tracks.length; i++) {
        if (artist_ids[i].includes(artist_id)) { //tracks[i] should be filtered to front
            let temp = newtracks[frontmost_index]
            newtracks[frontmost_index] = newtracks[i]
            newtracks[i] = temp
            frontmost_index++
        }
    }
    return newtracks
}

