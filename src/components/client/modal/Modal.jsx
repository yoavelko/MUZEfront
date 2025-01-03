import { useEffect, useState, useContext } from 'react'
import './Modal.css'
import axios from 'axios'
import { sendTrack } from '../../../utils/ClientRoutes'
import { SocketContext } from '../../../contexts/SocketContext'

function Modal({ modal, onClose }) {

    const [isCheck, setIsCheck] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [terms, setTerms] = useState(false);
    const { socket } = useContext(SocketContext);

    const handlBtnShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
    };

    async function handleSend() {

        const data = modal.track;
        try {
            const response = await axios.post(sendTrack, {
                url: data.spotify_url,
                name: data.trackName,
                img: data.img,
                uploaded: data.release_year,
                artist: data.artist,
                album: data.album
            })
            console.log('Track successfully sent:', response.data);
            socket.emit('track-req', response, 'room-1');
            onClose();
            return response.data;
        } catch (error) {
            console.error('Error sending track:', error.message);
            throw error;
        }

    }

    return (
        <div id='modal-container' onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className='modal-inner-container'>
                <button className='modal-close-btn' onClick={onClose}>
                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAkklEQVR4nNXUMQ5BURCF4fskStVt3v/fRSCvsQGdXmMNYglKC7AFvV1pdBIJUYjYwimYBXyZycycUv62aq0TdRYDgZ16A5YpswP2wENdJzvdqq9PxzG07/sN8FQPMVRdAXfgWEoZRdDW2gK4qqdhGMYpdKpe1PPvgS05ssml9MmzIXjYXfT1SIdD/cbXPIL9VL0BxNoohkUgHFoAAAAASUVORK5CYII=" />
                </button>
                <div className='modal-content-container'>
                    <div dir='ltr'>:השיר שבחרת</div>
                    <div><img id='modal-img' src={modal.track.img} alt="" /></div>
                    <div className='modal-title'>{modal.track.artist} - {modal.track.trackName}</div>
                    <div>{modal.track.album} &#x2022; {modal.track.release_year}</div>
                    <div className='modal-input-container'>
                        <label className="input-inner-container">
                            <input type="checkbox" onChange={() => setIsCheck(!isCheck)} />
                            <div className="input-checkmark"></div>
                        </label>
                        <div>אני מאשר/ת את<span className='terms' onClick={() => setTerms(!terms)}> תנאי השימוש</span></div>
                    </div>
                    <div className='terms-detail'>{terms && 'אני מאשר למכור את אחותי תמורת קילו תותים'}</div>
                    <button
                        className={`shake-button ${isShaking ? 'btn-shake' : 'send-btn'}`}
                        onClick={isCheck ? handleSend : handlBtnShake}
                    >שלח</button>
                </div>
            </div>
        </div>

    )
}

export default Modal