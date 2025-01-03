import { useContext, useState } from 'react';
import './QTrackBox.css';
import xIcon from '../../../media/x-icon.png';
import dragIcon from '../../../media/drag-icon.png';
import { Draggable } from '@hello-pangea/dnd';
import { removeFromQueue } from '../../../utils/AdminRoutes';
import axios from 'axios';
import { SocketContext } from '../../../contexts/SocketContext';

function QTrackBox({ track, index, setPlaySpecific }) {

    const { socket } = useContext(SocketContext);
    const [isHover, setIsHover] = useState(false);

    async function handleDelete() {
        const response = await axios.post(removeFromQueue, { track: track });
        socket.emit('queue-req', response, 'room-1');
    }

    return (
        <Draggable key={track.url} index={index} draggableId={track.url} >
            {
                (provided) => (
                    <div
                        className='q-trackbox-container'
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        onMouseEnter={() => setIsHover(true)}
                        onMouseLeave={() => setIsHover(false)}
                        onClick={() => {setPlaySpecific({url: track.url, index: index + 1}), console.log(track, index)}}
                    >
                        {
                            isHover ?
                                <div className='x-icon-btn-container'>
                                    <button className='x-icon-btn' onClick={handleDelete}>
                                        <img className='x-icon' src={xIcon} />
                                    </button>
                                </div>
                                :
                                <></>
                        }
                        <div className='q-left-flex'>
                            <div>{track.name} - {track.artist}</div>
                            <div className='q-small-text'>{track.album} - {track.uploaded}</div>
                        </div>
                        <div className='q-right-flex'>
                            <img className='q-trackbox-img' src={track.img} />
                        </div>
                        <div className='q-drag-container' {...provided.dragHandleProps}>
                            <img src={dragIcon} alt="" />
                        </div>
                    </div>
                )
            }
        </Draggable>
    )
}

export default QTrackBox;