import Vue from "vue";
import Vuex from "vuex";
import { createPersistedState, createSharedMutations } from "vuex-electron";

Vue.use(Vuex);

import modules from './modules'

export default new Vuex.Store({
    modules,
    plugins: [
        /*createPersistedState({
            paths: ['user'],
        }),
        createSharedMutations()*/
    ],
    strict: process.env.NODE_ENV != 'production'
});