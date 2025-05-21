import { combineReducers } from 'redux';
import authreducer from './authReducer/reducer';
import userreducer from './userReducer/reducer';

export default combineReducers({
    authreducer: authreducer,
    userreducer: userreducer
});
