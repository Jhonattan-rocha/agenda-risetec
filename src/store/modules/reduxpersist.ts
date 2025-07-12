import storage from "redux-persist/lib/storage";
import { persistReducer } from 'redux-persist';
import type { Reducer } from "redux";
import { encryptor } from "./encryptor";

export default function reducers(reducers: Reducer){
    const persistReducers = persistReducer(
        {
            key: "BASE",
            storage,
            whitelist: ['authreducer'],
            transforms: [encryptor],
        }, reducers
    );

    return persistReducers;
};

