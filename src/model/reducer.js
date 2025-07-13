// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import historyReducer from './historyStore';
import enchantReducer from './enchantDataSlice';

const store = configureStore({
    reducer: {
        history: historyReducer,
        enchant:enchantReducer
    }
});

export default store;