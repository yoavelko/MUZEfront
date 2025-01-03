import './TrackBox.css';

function TrackBox({ track, setModal, modal }) {
    const handleClick = () => {
        // Pass track data to the modal if needed
        setModal({ isOpen: true, track });
        console.log(modal.isOpen); 
    };

    return (
        <div className='track-box-container' onClick={handleClick}>
            <div className='track-box-img-container'>
                <img src={track.img} alt={track.trackName} className="track-box-img" />
            </div>
            <div className='track-box-right'>
                <div className='track-name'>{track.trackName} - {track.artist}</div>
                <div className='album-release-year'>{track.release_year} - {track.album}</div>
            </div>
        </div>
    );
}

export default TrackBox;

