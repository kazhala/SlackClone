import * as actionTypes from './types';

//redux action creators

export const setUser = user => {
    return ({
        type: actionTypes.SET_USER,
        payload: {
            currentUser: user
        }
    })
}