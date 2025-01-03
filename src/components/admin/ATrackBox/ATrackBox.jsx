import './ATrackBox.css'
import { Draggable } from '@hello-pangea/dnd';

function ATrackBox({ track, setMarked, index }) {


    function handleSetPush(e) {

        const isCheck = e.target.checked

        if (isCheck) {
            setMarked(prevState => ({
                tracks: [...prevState.tracks, track]
            }));
        } else {
            setMarked(prevState => ({
                tracks: prevState.tracks.filter(current => current.url !== track.url)
            }));
        }

    }

    return (
        <Draggable key={track.url} index={index} draggableId={track.url} >
            {
                (provided) => (
                    <div 
                    id='a-track-box-container' 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    dir='rtl'
                    {...provided.dragHandleProps}
                    >
                        <label className="cyberpunk-checkbox-label">
                            <input type="checkbox" className="cyberpunk-checkbox" onChange={(e) => handleSetPush(e)} />
                        </label>
                        <div className='a-track-box-img-container'>
                            <img src={track.img} alt='img' className="a-track-box-img" />
                        </div>
                        <div className='a-track-box-right'>
                            <div className='a-track-name'>{track.name} - {track.artist}</div>

                            {
                                track.rank < 1 ?
                                    <div className='a-track-time-req'>נשלח בשעה: {track.timeRequested}</div>
                                    :
                                    track.rank == 1 ?
                                        <div className='a-track-time-req'>נשלח פעמיים</div>
                                        :
                                        <div className='a-track-time-req'>נשלח {track.rank + 1} פעמים</div>
                            }
                        </div>
                    </div>
                )
            }
        </Draggable>
    )
}

export default ATrackBox