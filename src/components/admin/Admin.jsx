import './Admin.css';
import SpotifyPlayer from './SpotifyPlayer/SpotifyPlayer';
import { useEffect, useState, useContext } from 'react';
import { getAccessToken } from '../../utils/ClientRoutes';
import axios from 'axios';
import { getQueue, getReq, setQueue, setReqList, removeFromQueue, removeFromReqList, addToQueue, playlistToQueue, getPlaylists } from '../../utils/AdminRoutes';
import { SocketContext } from '../../contexts/SocketContext';
import ATrackBox from './ATrackBox/ATrackBox';
import QTrackBox from './QTrackBox/QTrackBox';
import { useListState } from '@mantine/hooks';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import addTrackIcon from '../../media/add-track.png';
import selectIcon from '../../media/select-icon.png';
import deleteIcon from '../../media/delete-icon.png';
import { Link } from 'react-router-dom';

function Admin() {
    const { socket } = useContext(SocketContext);
    const [spotifyToken, setSpotifyToken] = useState('');
    const [reqState, reqHandlers] = useListState([]);
    const [queState, queHandlers] = useListState([]);
    const [playlists, setPlaylists] = useState();
    const [marked, setMarked] = useState({ tracks: [] });
    const [selectAll, setSelectAll] = useState(false);
    const [loadPlaylist, setLoadPlaylist] = useState(false);
    const [playSpecific, setPlaySpecific] = useState(null);
    const [popModal, setPopModal] = useState({
        add: false,
        delete: false,
        select: false,
        playlist: false,
        previous: false,
        next: false,
        play: false,
        delQueue: false
    })

    const fetchToken = async () => {
        try {
            const response = await axios.post(getAccessToken);
            const token = response.data.token;
            localStorage.setItem('spotifyToken', token);
            setSpotifyToken(token);
        } catch (error) {
            console.error('Error fetching Spotify token:', error);
        }
    };

    const fetchReq = async () => {
        try {
            const response = await axios.get(getReq);
            reqHandlers.setState(response.data.sort((a, b) => b.rank - a.rank));
        } catch (error) {
            console.log('Error fetching request list:', error);
        }
    };

    const fetchQueue = async () => {
        try {
            const response = await axios.get(getQueue);
            queHandlers.setState(response.data);

        } catch (error) {
            console.log('Error fetching queue:', error);
        }
    };

    const fetchPlaylists = async () => {
        try {
            const response = await axios.get(getPlaylists);
            setPlaylists(response.data);
        } catch (error) {
            console.log('Error fetching playlists:', error);
        }
    }

    useEffect(() => {
        fetchToken();
        fetchReq();
        fetchQueue();
        fetchPlaylists();

        socket.on('track-req', fetchReq);
        socket.on('queue-req', fetchQueue);
        socket.on('playlist-req', fetchPlaylists);

        const intervalId = setInterval(fetchToken, 3000 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    async function handleDragEnd(destination, source) {
        if (destination.droppableId === source.droppableId) {
            if (destination.droppableId === 'req-list') {

                const updatedReqList = [...reqState];
                const [movedItem] = updatedReqList.splice(source.index, 1);
                updatedReqList.splice(destination.index, 0, movedItem);
                reqHandlers.setState(updatedReqList);
                await axios.post(setReqList, { tracks: reqState });

            } else {

                const updatedQueue = [...queState];
                const [movedItem] = updatedQueue.splice(source.index + 1, 1);
                updatedQueue.splice(destination.index + 1, 0, movedItem);
                queHandlers.setState(updatedQueue);
                await axios.post(setQueue, { tracks: updatedQueue });

            }
        } else if (destination.droppableId === 'queue') {

            const movedItem = reqState[source.index];
            const updatedReqList = [...reqState];
            updatedReqList.splice(source.index, 1);
            reqHandlers.setState(updatedReqList);
            await axios.post(setReqList, { tracks: updatedReqList });

            const updatedQueue = [...queState];
            updatedQueue.splice(destination.index + 1, 0, movedItem);
            queHandlers.setState(updatedQueue);
            await axios.post(setQueue, { tracks: updatedQueue });

        } else {
            return;
        }
    }

    function handleSelectAll() {
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = !selectAll;
        });
        setSelectAll(!selectAll);
        setMarked({ tracks: reqState });
    }

    async function handleDeleteReq() {
        const response = await axios.post(removeFromReqList, marked);
        setMarked({ tracks: [] });
        socket.emit('track-req', response, 'room-1');
    }

    async function handleAddToQueue() {
        const response = await axios.post(addToQueue, marked);
        setMarked({ tracks: [] });
        socket.emit('track-req', response, 'room-1');
        socket.emit('queue-req', response, 'room-1');
    }

    async function handleLoadPlaylist(playlist) {
        try {
            let response;
            if (playlist.isSpotifyPl) {
                response = await axios.post(playlistToQueue, { spotifyPlaylistId: playlist.mongoPlaylistId });
            } else {
                response = await axios.post(playlistToQueue, { mongoPlaylistId: playlist.mongoPlaylistId });
            }
            socket.emit('queue-req', response, 'room-1')
        } catch (error) {
            console.log('Error loading playlist:', error);
        }
    }


    return (
        <div id='admin-container' onClick={() => { loadPlaylist && setLoadPlaylist(false) }}>

            <DragDropContext
                onDragEnd={({ destination, source }) => handleDragEnd(destination, source)}
            >

                <div className='admin-inner-container'>
                    <div className='admin-left'>
                        <SpotifyPlayer
                            token={spotifyToken}
                            queue={queState}
                            loadPlaylist={loadPlaylist}
                            setLoadPlaylist={setLoadPlaylist}
                            popModal={popModal}
                            setPopModal={setPopModal}
                            playSpecific={playSpecific}
                        />
                        {
                            loadPlaylist && playlists?.length > 0 &&
                            <div className='playlists-container'>
                                <div>הפלייליסטים שלי</div>
                                {playlists.map((playlist, index) => (
                                    <button className='pl-pick-btn' key={index} onClick={() => handleLoadPlaylist(playlist)}>{playlist.name}</button>
                                ))}
                            </div>
                        }
                        {
                            queState.length > 1 ?
                                <div className='queue-header'>תור השמעה</div>
                                :
                                <div className='queue-header'>אין שירים ממתינים</div>
                        }
                        <Droppable droppableId='queue' direction='vertical'>
                            {
                                (provided) => (
                                    <div className='tracks-container-scroller' {...provided.droppableProps} ref={provided.innerRef}>
                                        {
                                            queState.slice(1).map((track, index) => (
                                                <QTrackBox track={track} key={index} index={index} setPlaySpecific={setPlaySpecific} />
                                            ))
                                        }
                                        {provided.placeholder}
                                    </div>
                                )
                            }
                        </Droppable>
                    </div>
                    <div className='admin-right'>
                        <div className='background-filler'>
                            <Link to={'dashboard'} target='_blank'>
                                <button>dashboard</button>
                            </Link>
                        </div>
                        <div className='req-controls'>
                            <button
                                className='req-controls-btn'
                                onClick={handleSelectAll}
                                onMouseEnter={() => setPopModal(prev => ({ ...prev, select: true }))}
                                onMouseLeave={() => setPopModal(prev => ({ ...prev, select: false }))}
                            >
                                <img src={selectIcon} style={{ width: '32px' }} />
                                {popModal.select && <div className='pop-modal'>סמן הכל</div>}
                            </button>
                            <button
                                className='req-controls-btn'
                                onClick={handleDeleteReq}
                                onMouseEnter={() => setPopModal(prev => ({ ...prev, delete: true }))}
                                onMouseLeave={() => setPopModal(prev => ({ ...prev, delete: false }))}
                            >
                                <img src={deleteIcon} style={{ width: '32px' }} />
                                {popModal.delete && <div className='pop-modal'>מחק</div>}
                            </button>
                            <button
                                className='req-controls-btn'
                                onClick={handleAddToQueue}
                                onMouseEnter={() => setPopModal(prev => ({ ...prev, add: true }))}
                                onMouseLeave={() => setPopModal(prev => ({ ...prev, add: false }))}
                            >
                                <img src={addTrackIcon} style={{ width: '36px' }} />
                                {popModal.add && <div className='pop-modal'>הוסף לתור השמעה</div>}
                            </button>
                        </div>
                        {
                            reqState.length > 0 ?
                                <div className='queue-header'>בקשות ממתינות</div>
                                :
                                <div className='queue-header'>אין בקשות ממתינות</div>
                        }
                        <Droppable droppableId='req-list' direction='vertical'>
                            {
                                (provided) => (
                                    <div className='tracks-container-scroller' {...provided.droppableProps} ref={provided.innerRef} style={{ marginRight: '40px', direction: 'ltr' }}>
                                        {
                                            reqState.map((track, index) => (
                                                <ATrackBox track={track} key={index} index={index} setMarked={setMarked} />
                                            ))
                                        }
                                        {provided.placeholder}
                                    </div>
                                )
                            }
                        </Droppable>
                    </div>
                </div>

            </DragDropContext>
        </div>
    );
}

export default Admin;
