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
						<template v-if="roomCode === ''">
							<div style="padding:10px;"> or </div>
							<b-button  @click="newRoom" variant="primary" size="lg">Create a new Room</b-button>
						</template>
						<b-button v-else variant="info" @click="joinRoom" size="lg" style="margin-left: 10px;">Join Room</b-button>
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

					<board ref="board" :fen="shownFen" @onMove="onMove" @onDraw="onBoardDraw"></board>
					
					<remotemouse ref="remotemouse" :board="$refs.board"></remotemouse>

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
						<h3 :title="roomCodeURL"> Room <b-badge> {{roomCode}} </b-badge> </h3>
					</div>

					<div class="controls text-center">
						<b-button-group size="sm">
							<b-button @click="flipBoard()" variant="dark"><b-icon-back variant="light" size="sm"></b-icon-back> Flip Board </b-button>
							<b-button @click="openFenModal()" variant="dark"> <b-icon-file-earmark-arrow-down-fill variant="light" size="sm"></b-icon-file-earmark-arrow-down-fill> Load FEN </b-button>
						</b-button-group>
					</div>

					<div class="controls text-center">

						<b-button-group size="sm">
							<b-button @click="moveToStart()" variant="dark"> <b-icon-skip-backward-fill font-scale="1.5" variant="light"></b-icon-skip-backward-fill> </b-button>
							<b-button @click="moveBackwards()" variant="dark"> <b-icon-play-fill rotate="180" font-scale="1.5" variant="light"></b-icon-play-fill> </b-button>
							<b-button @click="pauseTimer()" variant="dark"> <b-icon-pause-fill font-scale="1.5" variant="light"></b-icon-pause-fill> </b-button>
							<b-button @click="moveForward()" variant="dark"> <b-icon-play-fill font-scale="1.5" variant="light"></b-icon-play-fill> </b-button>
							<b-button @click="moveToNow()" variant="dark"> <b-icon-skip-forward-fill font-scale="1.5" variant="light"></b-icon-skip-forward-fill > </b-button>
						
						</b-button-group>
					</div>

					<movelistview ref="movelist"></movelistview>

				</div>
				<div class="settings">

					settings
					<b-form>
						<b-form-checkbox v-model="roomSettings.rules" size="sm" switch> chess rules </b-form-checkbox>
						<b-form-checkbox v-model="localSettings.sendMouseLoc" size="sm" switch> share mouse </b-form-checkbox>
						<b-form-checkbox v-model="roomSettings.shareDrawings" size="sm" switch> share drawings </b-form-checkbox>
					</b-form>
					
				</div>
			</div>

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
		position: relative;
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
		min-width:200px; 
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

	.controls {
		margin-left: auto;
		margin-right: auto;
	}


</style>

<script>
/* eslint-disable indent */

	"use strict";

	const ipcRenderer = require('electron').ipcRenderer;

	export default {
		name: "App",

		data() {
			return {
				roomSettings: {
					rules: true,
					shareDrawings: false,
				},
				localSettings: {
					sendMouseLoc: false,
					orientation: 'white',
				},
				startup: true,
				roomCode: "",
				dataConnection: null,
				boardState: null,

				boardIterator: -1,

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
					var board = document.getElementById('board');
					this.dataConnection.send({mouse:{
						x: this.localSettings.orientation === 'white' ? e.offsetX / board.clientHeight :  (board.clientHeight - e.offsetX) / board.clientHeight, 
						y: this.localSettings.orientation === 'white' ? e.offsetY / board.clientHeight : (board.clientWidth - e.offsetY) / board.clientHeight
					}});
				}
			};

			// Let main process know that we are ready for inputs
			ipcRenderer.send('ready', {});
			
			// when starting application from a deep link
			ipcRenderer.on('joinRoom', (evt, message) => {
				this.roomCode = message;
				this.joinRoom();
			});
					
		},

		computed: {

			moves() {
				return this.$refs.board ? this.$refs.board.history : [];
			},

			roomCodeURL() {
				return `https://isivisi.github.io/chessboard/joinroom?roomCode=${this.roomCode}`;
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

			flipBoard() {
				
				this.localSettings.orientation = this.localSettings.orientation === 'white' ? 'black' : 'white';
				this.$refs.board.orientation = this.localSettings.orientation;

			},

			moveToNow() {
				this.shownFen = this.boardStates[this.boardStates.length - 1];
			},

			moveToStart() {
				this.shownFen = this.boardStates[0];
			},

			moveBackwards() {
				this.shownFen = this.boardStates[0];
			},

			moveForward() {
				this.shownFen = this.boardStates[0];
			},

			joinRoom() {
				this.startup = false;

				console.log("connecting to room", this.roomCode);

				this.dataConnection = this.$peer.connect(this.roomCode);

				// listen to room data
				this.dataConnection.on('data', this.onData);

				// on connection opened
				this.dataConnection.on('open', () => {
					// TODO
				});
			},

			newRoom() {
				this.startup = false;
				this.roomCode = this.$peer.id;
				this.$nextTick(() => { this.initDataConnection(); });
			},

			onBoardDraw(drawable) {

				if (this.roomSettings.shareDrawings && !this.settingsChangeRecieved) {
					this.dataConnection.send({drawable: {
						shapes: drawable.shapes,
						current: drawable.current,
					}});
				}
				this.settingsChangeRecieved = false;

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
				if (data.drawable) {
					this.$refs.board.updateShapes(data.drawable);
					this.settingsChangeRecieved = true;
				}
				if (data.mouse) {
					var position = {};
					// this only works because the aspect ratio is locked
					var board = document.getElementById('board');
					position.x = (this.localSettings.orientation  === 'white' ? (data.mouse.x * board.clientHeight) : board.clientHeight - (data.mouse.x * board.clientHeight)) + 'px';
					position.y = (this.localSettings.orientation  === 'white' ? (data.mouse.y * board.clientHeight) : board.clientWidth - (data.mouse.y * board.clientHeight)) + 'px';
					this.$refs.remotemouse.setMousePos(position);
				}
			}
		}
	};
</script>
