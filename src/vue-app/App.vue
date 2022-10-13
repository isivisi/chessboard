<template>
	<div>

		<div v-if="startup">

			<b-jumbotron bg-variant="dark">

				<template #header>chessboard</template>

				<template #lead>
					its chess
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
				<b-row>
					<div class="opponent">
						<b-row>
							<b-col> Opponent </b-col> <b-col class="align-right text-right"> 0:00 </b-col>
						</b-row>
					</div>
					<board ref="board" :fen="shownFen" @onMove="onMove"></board>
					<div class="opponent">
						<b-row>
							<b-col> You </b-col> <b-col class="align-right text-right"> 0:00 </b-col>
						</b-row>
					</div>
				</b-row>
			</div>

			<div class="aside" id="aside">
				<div>
					<div> 
						<h3> Room <b-badge> {{roomCode}} </b-badge> </h3>
					</div>
					<movelistview ref="movelist"></movelistview>
				</div>
				<div class="settings">
					settings
					<b-form>
						<b-form-checkbox v-model="roomSettings.rules" size="sm" switch> chess rules </b-form-checkbox>
						<b-form-checkbox v-model="localSettings.sendMouseLoc" size="sm" switch> show mouse </b-form-checkbox>
					</b-form>
				</div>
			</div>

		</div>

		<remotemouse ref="remotemouse"></remotemouse>
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
		/*width: 75vw;*/
		height:0;
		padding-bottom:100%;
		width:100%;
	}

	.aside {
		grid-area: moves; 
		display:flex; 
		padding-top: 5px;
		width:200px; 
		flex-direction: column;
		justify-content: space-between;
	}

	.opponent {
		height: 25px;
		width:100%;
	}

	.you {
		height: 25px;
		width:100%;
	}

	.settings {

	}

</style>

<script>
/* eslint-disable indent */

	"use strict";

	export default {
		name: "App",

		data() {
			return {
				roomSettings: {
					rules: true,
				},
				localSettings: {
					sendMouseLoc: false,
				},
				startup: true,
				roomCode: "",
				dataConnection: null,
				boardState: null,

				shownFen: "",
				settingsChangeRecieved: false,
			}
		},

		components: {
			board: () => import("@/components/board.vue"),
			movelistview: () => import("@/components/movelistview.vue"),
			remotemouse: () => import("@/components/remotemouse.vue"),
		},

		mounted() {
			
			document.onmousemove = (e) => {
				if (this.dataConnection && this.localSettings.sendMouseLoc) {
					this.dataConnection.send({mouse:{
						x:e.clientX / window.innerHeight, 
						y:e.clientY / window.innerWidth
					}});
				}
			};
			
		},

		computed: {

			moves() {
				return this.$refs.board ? this.$refs.board.history : [];
			}

		},

		watch: {
			roomSettings: {
				handler() {
					if (this.dataConnection && !this.settingsChangeRecieved) this.dataConnection.send({roomSettings: this.roomSettings});
					this.settingsChangeRecieved = false;
				},
				deep: true,
			},

			'roomSettings.rules': function() {
				this.$refs.board.setRulesEnabled(this.roomSettings.rules);
			}
		},

		methods: {

			joinRoom() {
				this.startup = false;

				console.log("connecting to room", this.roomCode);

				this.dataConnection = this.$peer.connect(this.roomCode);

				if (this.$refs.remotemouse) this.$refs.remotemouse.setConnection(this.dataConnection);

				// listen to room data
				this.dataConnection.on('data', this.onData);
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
				console.log("initializing connection logic", this.$peer.id);

				// Listen for connections
				this.$peer.on('connection', (conn) => {
					console.log("someone has joined the room");
					this.dataConnection = conn;
					this.$refs.remotemouse.setConnection(this.dataConnection);
					// listen to room data
					conn.on('data', this.onData);
					conn.on('open', () => { this.dataConnection.send({
						boardState:this.boardState, 
						boardStates:this.$refs.movelist.boardStates,
						roomSettings: this.roomSettings,
					}); });
				});
			},

			onData(data) {
				if (!data.mouse) console.log(data);
				if (data.boardState) { 
					this.boardState = data.boardState;
					this.shownFen = data.boardState.fen;
					this.$refs.movelist.addState(data.boardState);
				}
				if (data.boardStates) {
					this.$refs.movelist.setBoardStates(data.boardStates);
				}
				if (data.roomSettings) {
					this.roomSettings = data.roomSettings;
					this.settingsChangeRecieved = true;
				}
			}
		}
	};
</script>
