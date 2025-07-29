import axios from 'axios';
import store from '../store';
import * as actions from '../store/modules/authReducer/actions';

const api = axios.create({
    baseURL: "https://cloud.risetec.com.br:11100/crud"
});

// Interceptor de respostas
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            store.dispatch(actions.Loguot()); // se for Vuex
        }

        return Promise.reject(error); // repassa o erro
    }
);

export default api;
