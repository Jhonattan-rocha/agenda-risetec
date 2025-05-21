export const LOGIN_REQUEST: string = "LOGIN_REQUEST";
export const LOGIN_SUCCESS: string = "LOGIN_SUCCESS";
export const LOGIN_FALURE: string = "LOGIN_FALURE";
export const LOGOUT: string = "LOGOUT";

export const USERS_REQUEST: string = "USERS_REQUEST"
export const USERS_SUCCESS: string = "USERS_SUCCESS"
export const USERS_FALURE: string = "USERS_FALURE"

export const USER_CREATE_REQUEST: string = "USER_CREATE_REQUEST"
export const USER_CREATE_SUCCESS: string = "USER_CREATE_SUCCESS"
export const USER_CREATE_FALURE: string = "USER_CREATE_FALURE"

export const USER_UPDATE_REQUEST: string = "USER_UPDATE_REQUEST"
export const USER_UPDATE_SUCCESS: string = "USER_UPDATE_SUCCESS"
export const USER_UPDATE_FALURE: string = "USER_UPDATE_FALURE"

export const USER_DELETE_REQUEST: string = "USER_DELETE_REQUEST"
export const USER_DELETE_SUCCESS: string = "USER_DELETE_SUCCESS"
export const USER_DELETE_FALURE: string = "USER_DELETE_FALURE"

export interface AuthState {
    isLoggedIn: boolean,
    token: string,
    user: {
        username: string,
        id: number
    }
}

export interface LoginProps {
    email: string;
    password: string;
}

export interface ActionProps {
    type: string;
    payload?: object;
}

export interface UserActionPayloadProps {
    id: number,
    email: string,
    password: string
}

export interface UserActionProps extends ActionProps {
    payload: UserActionPayloadProps
}

export interface FauleProps {
    error: string;
}

export interface SuccessProps {
    message: string;
}

export interface LoggedActionProps extends ActionProps {
    payload?: { token: string, email: string, id: number }
}