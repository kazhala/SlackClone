import { combineReducers } from 'redux';
import * as acitonTypes from '../actions/types';

//redux initial state 
const initialState = {
    currentUser: null,
    isLoading: true
}

//user reducer
const user_reducer = (state = initialState, action) => {
    switch (action.type) {
        case acitonTypes.SET_USER:
            return {
                currentUser: action.payload.currentUser,
                isLoading: false
            }
        case acitonTypes.CLEAR_USER:
            return {
                ...state,
                isLoading: false
            }
        default:
            return state;
    }
}

const initialChannelState = {
    currentChannel: null
}

//channel reducer
const channel_reducer = (state = initialChannelState, action) => {
    switch (action.type) {
        case acitonTypes.SET_CURRENT_CHANNEL:
            return {
                ...state,
                currentChannel: action.payload.currentChannel
            }
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    user: user_reducer,
    channel: channel_reducer
});

export default rootReducer;