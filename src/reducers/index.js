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
        default:
            return state;
    }
}

const rootReducer = combineReducers({
    user: user_reducer
});

export default rootReducer;