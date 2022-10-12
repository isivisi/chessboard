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
			
			this.roomCode = this.$peer.id;

			// On someone joined you
			/*this.$peer.on('connection', (conn) => { 
				console.log('someone has joined your room');
				this.dataConnection = conn;
				conn.send(this.boardState); // send room boardstate

				conn.on('data', (data) => {
					console.log('recieved change from host', data);
					this.boardState = data;
					this.shownFen = data.fen;
				});
			});*/

			this.initDataConnection();
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

				this.dataConnection.on('data', (data) => {
					console.log('recieved change', data);
					this.boardState = data;
					this.shownFen = data.fen;
				});

				// You joining someone
				this.$peer.on('connection', (conn) => {
					console.log("connection started");
					this.dataConnection = conn;
					conn.on('data', (data) => {
						console.log('recieved change', data);
						this.boardState = data;
						this.shownFen = data.fen;
					});
				})
			},
		}
	};
</script>
