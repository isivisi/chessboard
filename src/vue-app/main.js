"use strict";

import Vue from "vue";
import App from "@/App.vue";
import VuePeerJS from 'vue-peerjs';
import Peer from 'peerjs';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import store from './store'
var crypto = require("crypto");

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

const uniqueRoomKey = crypto.randomBytes(3).toString('hex').toUpperCase();
 
Vue.use(VuePeerJS, new Peer(uniqueRoomKey, {}));
Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

Vue.config.productionTip = false;

new Vue({
	render: h => h(App),
	store,
}).$mount("#app");
