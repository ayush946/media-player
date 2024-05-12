import v1 from './assest/1.mp4'
import v2 from './assest/2.mp4'
import v3 from './assest/3.mp4'
import v4 from './assest/4.mp4'
import a1 from './assest/a1.mp3'

export const NEXT_VIDEO = 'NEXT_VIDEO';
export const PREV_VIDEO = 'PREV_VIDEO';

export const nextVideo = () => ({type: NEXT_VIDEO});
export const prevVideo = () => ({type: PREV_VIDEO});

const initialState = {videoIndex:0 , video:[v1, v2 , v3, a1, v4]};

export const videoPlayerReducer = (state = initialState, action) => {
    switch(action.type){
        case NEXT_VIDEO:
            return {...state , videoIndex:(state.videoIndex + 1)% state.video.length};

        case PREV_VIDEO:
            return {...state, videoIndex:(state.videoIndex - 1 + state.video.length) % state.video.length};
        default:
            return state;
    }
}
