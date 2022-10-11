<template>
	<div id="app">
		<b-row>
			<b-col> Room Code: </b-col>
			<b-col> <b-form-input v-model.lazy="roomCode" :placeholder="roomCode"></b-form-input> </b-col>
		</b-row>

			<board ref="board" :fen="shownFen" @onMove="onMove"></board>

	</div>
</template>

<script>
/* eslint-disable indent */

	"use strict";

	var crypto = require("crypto");

	export default {
		name: "App",

		data() {
			return {
				roomCode: "",
				dataConnection: null,
				boardState: null,

				shownFen: "",
			}
		},

		components: {
			board: () => import("@/components/board.vue")
		},

		watch: {
			roomCode: function (code) {
				this.initDataConnection();
			}
		},

		mounted() {
			
			this.roomCode = this.$peer.id; //crypto.randomBytes(4).toString('hex');

			this.$peer.on('connection', (conn) => { 
				this.dataConnection = conn;
				conn.send(this.boardState); // send room boardstate

				conn.on('data', (data) => {
					console.log("peerjs", data);
					this.boardState = data;
					this.shownFen = data.fen;
				});
			});
		},

		methods: {

			onMove(move) {
				console.log(move);

				this.boardState = move;
				if (this.dataConnection) this.dataConnection.send(move);
			},

			initDataConnection() {
				console.log("connecting to room", this.roomCode);

				this.dataConnection = this.$peer.connect(this.roomCode);

				this.dataConnection.on('connection', (conn) => {
					console.log("connection started");
					this.dataConnection = conn;
					conn.on('data', function(data){
						console.log("peerjs", data);
						this.boardState = data;
						this.shownFen = data.fen;
					});
				})
			},
		}
	};
</script>
