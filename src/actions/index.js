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

export const clearUser = () => {
    return ({
        type: actionTypes.CLEAR_USER,
    })
}

export const setLoading = () => {
    return ({
        type: actionTypes.SET_LOADING,
    })
}