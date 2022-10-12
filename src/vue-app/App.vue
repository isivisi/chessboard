<template>
	<div id="app">
		<b-row style="grid-area:header; max-height:100px;">
			<b-col> Room Code: </b-col>
			<b-col> <b-form-input v-model.lazy="roomCode" :placeholder="roomCode"></b-form-input> </b-col>
		</b-row>

		<div style="grid-area:main">


			<b-row >
				<board ref="board" :fen="shownFen" @onMove="onMove"></board>
			</b-row>

		</div>

		<div style="grid-area:moves; max-width:200px;">
			{{moves}}
		</div>

		

	</div>
</template>

<style>

	#app {
		display: grid;
		grid-template:
		'header header header header header header'
		'main main main main main moves';
		gap: 2px;
	}

</style>

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

		computed: {

			moves() {
				return this.$refs.board ? this.$refs.board.history() : [];
			}

		},

		methods: {

			onMove(move) {
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
					conn.send(this.boardState); // send room boardstate
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
