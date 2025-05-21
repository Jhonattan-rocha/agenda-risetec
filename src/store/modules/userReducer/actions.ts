import * as types from '../types'

export function USER_CREATE_REQUEST(payload: types.UserActionPayloadProps){
    return {
        type: types.USER_CREATE_REQUEST,
        payload: payload,  
    };
}

export function USER_CREATE_SUCCESS(payload: types.UserActionPayloadProps){
    return  {
        type: types.USER_CREATE_SUCCESS,
        payload: payload,
    };
}

export function USER_CREATE_FALURE(payload: types.FauleProps){
    return  {
        type: types.USER_CREATE_FALURE,
        payload: payload,
    };
}

export function USER_UPDATE_REQUEST(payload: types.UserActionPayloadProps){
    return {
        type: types.USER_UPDATE_REQUEST,
        payload: payload,  
    };
}

export function USER_UPDATE_SUCCESS(payload: types.UserActionPayloadProps){
    return  {
        type: types.USER_UPDATE_SUCCESS,
        payload: payload,
    };
}

export function USER_UPDATE_FALURE(payload: types.FauleProps){
    return  {
        type: types.USER_UPDATE_FALURE,
        payload: payload,
    };
}
