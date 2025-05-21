import * as type from '../types';
import { toast } from 'react-toastify';

const initialState = {
    id: 0,
    email: '',
    password: ''
}
// caso precise de mais de um reducer, usar a função combineReducer

export default function recuder(state = initialState, action: type.UserActionProps){
    switch (action.type) {
        case type.USER_UPDATE_SUCCESS: {
            if(action.payload){
                const newState = {...state};
                newState.id = action.payload.id;
                newState.email = action.payload.email;
                newState.password = '';
                return newState;
            }
            return state;
        }

        case type.USER_UPDATE_FALURE: {
            toast.error("Erro ao editar o usuário");
            return state;
        }

      // aqui você pode definir suas ações e como o estado deve ser atualizado;
      default:
        return state;
    }
};

