import React , {useEffect, useRef, useState, useCallback} from 'react';
import "./videoPlayer.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause, faRotateRight, faRotateLeft, faExpand, faForwardStep, faBackwardStep, faVolumeXmark, faVolumeHigh, faClone, faHeadphones, faSpinner} from '@fortawesome/free-solid-svg-icons'
import { useSelector, useDispatch } from 'react-redux';
import {nextVideo, prevVideo} from './Redux'

function VideoPlayer() {

    const dispatch = useDispatch();
    const src = useSelector(state => state.video[state.videoIndex]);
    

    const videoRef = useRef(null);
    const playerRef = useRef(null);
    const controlRef = useRef(null);
    const timeoutRef = useRef(null);
    const [playing , setPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime , setCurrentTime] = useState(0);
    const [mute , setMute] = useState(false);
    const [volume, setVolume] = useState(1);
    const [playbackRate,setPlaybackRate] = useState(1);
    const [fullScreen, setFullScreen] = useState(false);
    const [isControlsVisible, setControlsVisible] = useState(true);  // in full screen mode
    const [audioIcon, setAudioIcon] = useState(true);
    const [buffering, setBuffering] = useState(false);
    
    useEffect( () => {
        const words = src.split('.');
        if(words[words.length - 1] === 'mp3'){
            setAudioIcon(true);
        }else{
            setAudioIcon(false);
        }

    }, [src]);
    
    

    useEffect( () => {
        const video = videoRef.current;
        video.addEventListener('loadedmetadata', () => {
            setDuration(video.duration);
        });
        video.addEventListener('timeupdate', () => {
            setCurrentTime(video.currentTime);
        })
        video.autoplay = true;
    }, []);

    useEffect(() => {
        const video = videoRef.current;
    
        const handleWaiting = () => {
            // Pause the player and show a loading spinner.
            setBuffering(true);
        };
    
        const handlePlaying = () => {
            // Resume playback and hide the loading spinner.
            setBuffering(false);
        };
    
        video.addEventListener('waiting', handleWaiting);
        video.addEventListener('playing', handlePlaying);
    
        return () => {
            video.removeEventListener('waiting', handleWaiting);
            video.removeEventListener('playing', handlePlaying);
        };
    }, []);
    
    
    const togglePlayPause = useCallback(() => {
        if(playing){
            videoRef.current.pause();
        }else{
            videoRef.current.play();
        }
        setPlaying(!playing);
    },[playing]);
    
    const handleMute = useCallback( () =>{
        console.log(videoRef);
        if(mute){
            videoRef.current.muted = false;
        }else{
            videoRef.current.muted = true;
        }
        setMute(!mute);
    },[mute]);
    
    const handleForward10sec = useCallback( () => {
        setCurrentTime( currentTime => {
            let newTime = currentTime + 10;
            if(newTime > duration){
                newTime = duration;
            }
            videoRef.current.currentTime = newTime;
            return newTime;
        });
    },[duration]);

    const handleBackward10sec = useCallback(() => {
        setCurrentTime( currentTime => {
            let newTime = currentTime - 10;
            if(newTime < 0){
                newTime = 0;
            }
            videoRef.current.currentTime = newTime;
            return newTime;
        })
    }, []);
    
    const handlePlaybackRateChange = (event) =>{
        const rate = event.target.value;
        videoRef.current.playbackRate = rate;
        setPlaybackRate(rate);
    }

    const handleVolumeChange = (event) =>{
        setVolume(event.target.valueAsNumber);
        videoRef.current.volume = volume;
    }
    const handleFullscreen = useCallback(() => {
        const player = playerRef.current;
        if (player.requestFullscreen) {
            player.requestFullscreen();
        } else if (player.mozRequestFullScreen) { 
            player.mozRequestFullScreen();
        } else if (player.webkitRequestFullscreen) { 
            player.webkitRequestFullscreen();
        } else if (player.msRequestFullscreen) { 
            player.msRequestFullscreen();
        }
    
        const handleFullscreenChange = () => {
            // Check if the document is in fullscreen mode
            const isFullscreenNow = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    
            setFullScreen(Boolean(isFullscreenNow));
        };
    
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
        // Clean up the event listeners when the component unmounts
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, []);
    

    const handleMouseMove = () => {
        setControlsVisible(true);
        if(timeoutRef.current){
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout( () => {
            setControlsVisible(false);
        }, 1000);
    };
    useEffect(() => {
        const controlsElements = playerRef.current;
        controlsElements.addEventListener('mousemove', handleMouseMove);
        return () => {
            controlsElements.removeEventListener('mousemove', handleMouseMove);
        }
    },[]);

    const handlePip = useCallback( () => {
        videoRef.current.requestPictureInPicture(); 
    }, []);

    const progressClick = (event) =>{
        console.log(event);

        const progressBar= event.target;
        const clickPosition = event.clientX - progressBar.getBoundingClientRect().left;
        const progressBarWidth = progressBar.offsetWidth;
        const seekTime = (clickPosition/ progressBarWidth) * videoRef.current.duration;
        videoRef.current.currentTime = seekTime;
        setCurrentTime(seekTime);
    }
    const handleNextVideo = useCallback (() => {
        dispatch(nextVideo());
    },[dispatch]);
    const handlePrevVideo = useCallback( ()=> {
        dispatch(prevVideo());
    },[dispatch]);
    
    useEffect( () => {
        const handleSpacebarPress = (event) =>{
            if(event.code === 'Space'){
                togglePlayPause();
            }
            if(event.code === 'KeyM'){
                handleMute();
            }
            if(event.code === 'ArrowRight'){
                handleForward10sec();
            }
            if(event.code === 'ArrowLeft'){
                handleBackward10sec();
            }
            if(event.code === 'KeyF'){
                handleFullscreen();
            }
            if(event.code === 'KeyN'){
                handleNextVideo();
            }
            if(event.code === 'KeyP'){
                handlePrevVideo();
            }
            if(event.code === 'KeyW'){
                handlePip();
            }
        }

        window.addEventListener('keydown', handleSpacebarPress);
        return () => {
            window.removeEventListener('keydown', handleSpacebarPress);
        }

    },[togglePlayPause, handleMute, handleForward10sec, handleBackward10sec, handleFullscreen, handleNextVideo, handlePrevVideo, handlePip]);

    const secTOmin = (t) => {
        const min = Math.floor(t / 60);
        const sec = Math.floor(t % 60);
        return {min, sec};
    }

    return(
        <div className='main'>
        
        
        <div className={'video-player'} ref={playerRef}>
            <video ref={videoRef} src={src} onClick={togglePlayPause}/> 
            {!fullScreen && playing && <div className='overlay' onClick={togglePlayPause}>
                <FontAwesomeIcon icon={playing? faPause: faPlay}/>
            </div>}
            {!playing && <div className='overlay-paused' onClick={togglePlayPause}>
                <FontAwesomeIcon icon ={playing?faPause: faPlay}/>
            </div>}
            
            {audioIcon && <div className='audioIcon fa-8x' style={{color:'#153448'}}>
                <FontAwesomeIcon icon={faHeadphones}/>
            </div>}
            {buffering && <div className='audioIcon fa-3x'>
                <FontAwesomeIcon icon={faSpinner} style={{color:'white'}} spinPulse/>
                </div>}
            <div  style={{display:'flex', justifyContent:'center'}}>
                <div ref={controlRef} className={fullScreen ? (isControlsVisible?'controls-fullscreen':'controls-fullscreen-hidden') :(playing?'player-options': 'player-option-paused')}>
                    <div className='bar' onClick={progressClick}>
                        <div className='progress-bar'  style={{width: `${(currentTime / duration) * 100}%`}}></div>
                    </div>
                    <div className='time'>
                        <div> 
                            {secTOmin(currentTime).min}:{secTOmin(currentTime).sec < 10 ? `0${secTOmin(currentTime).sec}` : secTOmin(currentTime).sec}
                        </div>
                        <div> 
                            {secTOmin(duration).min}:{secTOmin(duration).sec < 10 ? `0${secTOmin(duration).sec}` : secTOmin(duration).sec}
                        </div>
                    </div>

                    <div className='controls'>
                        <div className='group-1'>
                            <div onClick={handleMute}>
                                <FontAwesomeIcon style={{color:'white'}} icon={mute? faVolumeXmark : faVolumeHigh}/>
                            </div>

                            <div className='slider'>
                                <input type='range' min={0} max={1} step={0.02} value={volume} onChange={handleVolumeChange}/>
                            </div>
                        </div>
                        <div className='group-2'>
                            <div onClick={handlePrevVideo}>
                                <FontAwesomeIcon style={{color:'white'}} icon={faBackwardStep}/>
                            </div>
                            <div onClick={handleBackward10sec}> 
                                <FontAwesomeIcon style={{color:'white'}} icon={faRotateLeft}/>
                            </div>
                            <div onClick={togglePlayPause}>
                                <FontAwesomeIcon className='fa-2x' style={{color:'white'}} icon={playing?faPause:faPlay}/>
                            </div>
                            <div onClick={handleForward10sec}>
                                <FontAwesomeIcon style={{color:'white'}} icon={faRotateRight}/>
                            </div>
                            <div onClick={handleNextVideo}>
                                <FontAwesomeIcon style={{color:'white'}} icon={faForwardStep}/>
                            </div>
                        </div>
                        <div className='group-3'>
                            <div className="playback">
                                <select onChange={handlePlaybackRateChange} value={playbackRate}>
                                    <option value="0.5">0.5x</option>
                                    <option value="1">1x</option>
                                    <option value="1.5">1.5x</option>
                                    <option value="2">2x</option>
                                    <option value="2.5">2.5x</option>
                                    <option value="3">3x</option>
                                    <option value="3.5">3.5x</option>
                                    <option value="4">4x</option>
                                </select>
                            </div>
                            {!audioIcon && <div onClick={handlePip}>
                                <FontAwesomeIcon style={{color:'white'}} icon={faClone}/>
                            </div>}
                            <div onClick={handleFullscreen}>
                                <FontAwesomeIcon style={{color:'white'}} icon={faExpand} />
                            </div>

                        </div>
                    </div>

                </div>
                
            </div>

            
            
            
            
        </div>
        </div>
    );
};

export default VideoPlayer;
