<template>
	<div>

		<div v-if="startup">

			<b-jumbotron bg-variant="dark">

				<template #header class="text-center">
					<img src="@/assets/logo.min.png" width="50" height="50"> <span class="display-4 fw-bold" style="font-weight: 700 !important;">Chessboard</span> 
				</template>

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

			<b-modal header-text-variant="dark" body-text-variant="dark" id="gameOverModal" hide-footer>
				<template #modal-title>
					Game Over
				</template>
				<div class="d-block text-center">
				<h3 v-if="boardState.game.inCheckmate">{{winner()}} has won!</h3>
				<h3 v-else>Draw</h3>
				<p v-if="boardState.game.inCheckmate"> won by checkmate. </p>
				<p v-if="boardState.game.inRepitition"> draw by repitition </p>
				<p v-if="boardState.game.insufficiantMaterial"> won by insufficiant material </p>
				</div>
				<b-button variant="success" class="mt-3" block @click="$bvModal.hide('gameOverModal')">Reset Board</b-button>
				<b-button variant="secondary" class="mt-3" block @click="$bvModal.hide('gameOverModal')">Close</b-button>
			</b-modal>

			<b-modal header-text-variant="dark" body-text-variant="dark" id="fenModal"  @show="fenToLoad = null" @hidden="fenToLoad = null" @ok="loadFEN">
				<template #modal-title>
					Input FEN
				</template>

				<form ref="form" @submit.stop.prevent="loadFEN">
					<b-form-group label="FEN" label-for="fen-input" invalid-feedback="FEN is required">
						<b-form-input id="fen-input" v-model="fenToLoad" required pattern="\s*^(((?:[rnbqkpRNBQKP1-8]+\/){7})[rnbqkpRNBQKP1-8]+)\s([b|w])\s(-|[K|Q|k|q]{1,4})\s(-|[a-h][1-8])\s(\d+\s\d+)$"></b-form-input>
					</b-form-group>
				</form>

			</b-modal>

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

					<div class="text-center"> 
						<h3> Room {{roomCode}} <b-button :title="roomCodeURL" size="sm" class="mb-2"> <b-icon-clipboard @click="copyCodeToClipboard"></b-icon-clipboard> </b-button> </h3>
					</div>

					<div class="controls text-center">
						<b-button-group size="sm">
							<b-button @click="flipBoard()" variant="dark"><b-icon-back variant="light" size="sm"></b-icon-back> Flip Board </b-button>
							<b-button @click="$bvModal.show('fenModal');" variant="dark"> <b-icon-file-earmark-arrow-down-fill variant="light" size="sm"></b-icon-file-earmark-arrow-down-fill> Load FEN </b-button>
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
		max-width: 250px; 
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
	const { clipboard } = require('electron');
	const { DEFAULT_POSITION } = require('chess.js');

	const movePieceAudio = require('@/assets/movePiece.ogg');
	const takePieceAudio = require('@/assets/pieceTaken.ogg');

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
				boardState: {
					fen: DEFAULT_POSITION,
					move: '',
					game: {
						gameOver: false,
						inCheck: false,
						inCheckmate: false,
						inDraw: false,
						inRepitition: false,
						insufficiantMaterial: false,
						turnColor: 'white',
					}
				},
				boardStates: [
					{
						fen: DEFAULT_POSITION,
					},
				],

				boardIterator: 0,

				shownFen: "",
				fenToLoad: null,
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
			},

			boardIterator: function() {
				// only allow moving pieces when looking at active state
				this.$refs.board.set({
					viewOnly: this.boardIterator < this.boardStates.length-1,
				});
			}
		},

		methods: {

			winner() {
				if (this.boardState && this.boardState.game.gameOver) {
					if (this.boardState.game.inCheckmate && !this.boardState.game.inDraw) return this.boardStates[this.boardStates.length-2].game.turnColor;
				}
				return null;
			},

			copyCodeToClipboard() {
				clipboard.writeText(this.roomCodeURL);
			},

			flipBoard() {
				
				this.localSettings.orientation = this.localSettings.orientation === 'white' ? 'black' : 'white';
				this.$refs.board.orientation = this.localSettings.orientation;

			},

			moveToNow() {
				if (this.boardIterator == this.boardStates.length-1) return;
				this.shownFen = this.boardStates[this.boardStates.length - 1].fen;
				this.boardIterator = this.boardStates.length -1;
			},

			moveToStart() {
				if (this.boardIterator <= 0) return;
				this.shownFen = this.boardStates[0].fen;
				this.boardIterator = 0;
			},

			moveBackwards() {
				if (this.boardIterator <= 0) return;
				this.boardIterator--;
				this.shownFen = this.boardStates[this.boardIterator].fen;
			},

			moveForward() {
				if (this.boardIterator >= this.boardStates.length-1) return;
				this.boardIterator++;
				this.shownFen = this.boardStates[this.boardIterator].fen;
			},

			loadFEN() {
				this.shownFen = this.fenToLoad;
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

				if (!this.dataConnection) return;

				if (this.roomSettings.shareDrawings && !this.settingsChangeRecieved) {
					this.dataConnection.send({drawable: {
						shapes: drawable.shapes,
						current: drawable.current,
					}});
				}
				this.settingsChangeRecieved = false;

			},

			playSound(soundFile) {
				var audio = new Audio(soundFile);
				audio.loop = false;
				audio.play(); 
			},

			onMove(move) {
				this.setGameState(move);

				if (this.dataConnection) {
					console.log('sending state');
					this.dataConnection.send({boardState:move});
				}
			},

			setGameState(state) {
				this.boardState = state;
				this.$refs.movelist.addState(state);
				this.boardStates.push(state);
				this.boardIterator = this.boardStates.length - 1;

				if (state.move.includes('x')) this.playSound(takePieceAudio);
				else this.playSound(movePieceAudio);

				if (this.boardState.game.gameOver) this.$bvModal.show('gameOverModal');
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
					this.shownFen = data.boardState.fen;
					this.setGameState(data.boardState);
				}
				if (data.boardStates) {
					this.$refs.movelist.setBoardStates(data.boardStates);
					this.playSound(movePieceAudio);
					this.boardStates = data.boardStates;
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
