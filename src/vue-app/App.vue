<template>
	<div>

		<div v-if="startup">

			<b-jumbotron bg-variant="dark">

				<template #header>chessboard</template>

				<template #lead>
					Free online chessboard
				</template>

				<div>
					<b-form inline onsubmit="return false">
						<b-form-input @keyup.enter="joinRoom"  v-model="roomCode" placeholder="Join with room ID" size="lg"></b-form-input> 
						<div style="padding:10px;"> or </div>
						<b-button @click="newRoom" variant="primary" size="lg">Create a new Room</b-button>
					</b-form>
				</div>

			</b-jumbotron>

		</div>
		<div v-else id="app">

			<div class="boardarea">
				<b-row >
					<board ref="board" :fen="shownFen" @onMove="onMove"></board>
				</b-row>
			</div>

			<div class="aside">
				<div> 
					<h3> Room <b-badge> {{roomCode}} </b-badge> </h3>
				</div>
				<movelistview ref="movelist"></movelistview>
			</div>

			
			<remotemouse ref="remotemouse"></remotemouse>

		</div>
	</div>
</template>

<style>

	#app {
		display: grid;
		grid-template: 'main main main main main moves';
		gap: 2px;
	}

	.boardarea {
		grid-area:main;
		padding: 5px 25px 25px 25px;
		width: 75vw;
	}

	.aside {
		grid-area: moves; 
		display:flex; 
		padding-top: 5px;
		width:25vw; 
		flex-direction: column;
	}

</style>

<script>
/* eslint-disable indent */

	"use strict";

	export default {
		name: "App",

		data() {
			return {
				startup: true,
				roomCode: "",
				dataConnection: null,
				boardState: null,

				shownFen: "",
			}
		},

		components: {
			board: () => import("@/components/board.vue"),
			movelistview: () => import("@/components/movelistview.vue"),
			remotemouse: () => import("@/components/remotemouse.vue"),
		},

		mounted() {

			this.initDataConnection();
			
			document.onmousemove = (e) => {
				if (this.dataConnection) this.dataConnection.send({mouse:{x:e.clientX, y:e.clientY}});
			};
			
		},

		computed: {

			moves() {
				return this.$refs.board ? this.$refs.board.history() : [];
			}

		},

		methods: {

			joinRoom() {
				this.startup = false;
				this.$nextTick(() => { this.initDataConnection(); });
			},

			newRoom() {
				this.startup = false;
				this.roomCode = this.$peer.id;
				this.$nextTick(() => { this.initDataConnection(); });
			},

			onMove(move) {
				this.boardState = move;
				this.$refs.movelist.addState(move);
				if (this.dataConnection) {
					console.log('sending state');
					this.dataConnection.send({boardState:move});
				}
			},

			initDataConnection() {
				console.log("connecting to room", this.roomCode);

				this.dataConnection = this.$peer.connect(this.roomCode);

				if (this.$refs.remotemouse) this.$refs.remotemouse.setConnection(this.dataConnection);

				this.dataConnection.on('data', (data) => {
					if (data.boardState) { 
						this.boardState = data.boardState;
						this.shownFen = data.boardState.fen;
						this.$refs.movelist.addState(data.boardState);
					}
				});

				// You joining someone
				this.$peer.on('connection', (conn) => {
					console.log("connection started");
					this.dataConnection = conn;
					this.$refs.remotemouse.setConnection(this.dataConnection);
					conn.send({boardState:this.boardState}); // send room boardstate
					conn.on('data', (data) => {
						if (data.boardState) { 
							this.boardState = data.boardState;
							this.shownFen = data.boardState.fen;
							this.$refs.movelist.addState(data.boardState);
						}
					});
				})
			},
		}
	};
</script>
