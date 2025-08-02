import * as type from '../types';
import { toast } from 'react-toastify';

const initialState = {
    isLoggedIn: false,
    token: "",
    user: {
        name: "",
        email: "",
        id: -1,
        profile: {}
    }, 
}
// caso precise de mais de um reducer, usar a função combineReducer

export default function recuder(state = initialState, action: type.LoggedActionProps){
    switch (action.type) {
        case type.LOGIN_SUCCESS: {
            if(action.payload){
                const newState = {...state};
                newState.user = {
                    name: action.payload.name,
                    email: action.payload.email,
                    id: action.payload.id,
                    profile: action.payload.profile
                };
                newState.token = action.payload.token;
                newState.isLoggedIn = true;
                return newState;
            }
            return state;
        }

        case type.LOGIN_FALURE: {
            toast.error("Erro ao realizar o login");
            const newState = initialState;
            return newState;
        }

        case type.LOGOUT: {
            const newState = initialState;
            localStorage.setItem("authToken", "");
            toast.success("Logout feito com sucesso");
            return newState;
        }

      // aqui você pode definir suas ações e como o estado deve ser atualizado;
      default:
        return state;
    }
};

