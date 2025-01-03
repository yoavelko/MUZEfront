import './Client.css';
import SearchBar from './searchBar/SearchBar';
import Footer from './footer/Footer';
import LOGO from '../../media/MUZE-red-nobg.png';
import { useRef, useEffect, useState } from 'react';
import Loader from './loader/Loader';
import TrackBox from './trackBox/TrackBox';
import { getAccessToken, getPlaylist } from '../../utils/ClientRoutes';
import { getMostPlayed } from '../../utils/StatisticsRoutes';
import axios from 'axios';
import Modal from './modal/Modal'
import { createPortal } from 'react-dom';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';


function Client() {

    const [loader, setLoader] = useState(false);
    const [isSearch, setIsSearch] = useState(false);
    const [isr, setIsr] = useState('israel');
    const [data, setData] = useState(null);
    const elementRef = useRef(null);
    const [modal, setModal] = useState({
        isOpen: false,
        track: null
    });

    modal.isOpen ? disableBodyScroll(document) : enableBodyScroll(document)

    // Use a separate function to fetch playlist based on search results
    const fetchPlaylist = async (accessToken) => {
        try {

            let searchResponse;

            if (isr === 'israel') {
                const response = await axios.post(getPlaylist, {
                    isr: true,
                    token: accessToken
                });
                searchResponse = response.data.tracks
            } else if (isr === 'global') {
                const response = await axios.post(getPlaylist, {
                    isr: false,
                    token: accessToken
                });
                searchResponse = response.data.tracks
            } else if (isr === 'around') {
                const response = await axios.post(getMostPlayed, { timeFrame: "overall" });
                searchResponse = response.data.map(track => ({
                    artist: track.artist,
                    img: track.img,
                    release_year: track.uploaded,
                    spotify_url: track.url,
                    trackName: track.name,
                    album: track?.album
                }))
            }
            const inputs = document.querySelectorAll('input[type="text"]');
            inputs.forEach(input => {
                input.value = "";
            });
            setData(searchResponse);

        } catch (err) {
            console.error('Error during fetching playlist:', err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoader(true);
            try {
                // Fetch the access token first
                const tokenResponse = await axios.post(getAccessToken);
                const accessToken = tokenResponse.data?.token;

                // Call fetchPlaylist to get the playlist data
                if (isr) await fetchPlaylist(accessToken);
            } catch (err) {
                console.error('Error during initial data fetch:', err);
            }
            setLoader(false);
        };

        fetchData();
    }, [isr]);

    return (
        <>
            <div id='client-container'>
                <div ref={elementRef} className='slogan-container'>
                    <img src={LOGO} id='muzit-logo' />
                </div>
                <SearchBar setLoader={setLoader} setData={setData} setIsSearch={setIsSearch} setIsr={setIsr} />
                {
                    loader ? (
                        <Loader />
                    ) : (
                        data?.map((track, index) => (
                            <TrackBox
                                key={index}
                                track={track}
                                setModal={setModal}
                                modal={modal}
                            />
                        ))
                    )
                }
                <Footer isr={isr} setIsr={setIsr} loader={loader} setIsSearch={setIsSearch} isSearch={isSearch} />
            </div>
            {modal.isOpen && createPortal(
                <Modal onClose={() => setModal(false)} modal={modal} />,
                document.body
            )}
        </>
    );
}

export default Client;
