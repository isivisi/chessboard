<template>

		<div ref="board" class="board">

		</div>

</template>

<style>

	.board {
		width:100%;
		height: 100%;
		padding-top:100%; /* 1:1 aspect */
	}

	.cg-wrap {
		border-radius: 3px;
	}

</style>

<script>

	import {chessboard} from 'vue-chessboard';
	import {Chessground} from 'chessground';
	//import 'vue-chessboard/dist/vue-chessboard.css';

	import 'chessground/assets/chessground.base.css';
	import 'chessground/assets/chessground.brown.css';
	//import 'chessground/assets/chessground.cburnett.css';

	import '@/styles/pieces/staunty.css';

	import { Chess, SQUARES } from 'chess.js';

	export default {
		name: "board",

		props: ['fen'],

		data() {
			return {
				game: null,
				board: null,
				observer: null,
			}
		},

		created () {
			this.game = new Chess();
			this.game.load("");
		},

		mounted() {

			this.board = Chessground(this.$refs.board, {
				animation: {
					enabled: true,
				}
			});
			
			//this.board.set(config);
			
			window.addEventListener('resize', this.onResize);
			//this.observer = new ResizeObserver(() => this.onResize(), this.$refs.boardwrapper);

			this.onResize();

			this.loadPosition();

		},

		unmounted() {
			window.removeEventListener('resize', this.onResize);
		},

		watch: {
			 fen: function (newFen) {
				this.fen = newFen
				this.loadPosition()
			},
		},

		methods: {
			// https://github.com/vitogit/vue-chessboard/blob/master/src/components/chessboard/index.vue
			possibleMoves () {
				const dests = {}
				SQUARES.forEach(s => {
					const ms = this.game.moves({square: s, verbose: true})
					if (ms.length) dests[s] = ms.map(m => m.to)
				})
				return dests
			},

			toColor () {
				return (this.game.turn() === 'w') ? 'white' : 'black'
			},

			onMoved() {
				return (orig, dest, metadata) => {
					var move = this.game.move({from: orig, to: dest})

					this.board.set({
						fen: this.game.fen(),
						turnColor: this.toColor(),
						movable: {
							color: this.toColor(),
							//dests: this.possibleMoves(),
						},
					});

					if (!move) return;

					this.$emit('onMove', {history: this.game.history(), fen: this.game.fen()});
				}
			},

			// load positional data for both Chess.js and Chessground
			loadPosition() {
				this.game.load(this.fen);
				 this.board.set({
					fen: this.game.fen(),
					turnColor: this.toColor(),
					movable: {
						color: this.toColor(),
						free: true,
						//dests: this.possibleMoves(),
					},
					orientation: 'white',
				});

				this.board.set({
					movable: { events: { after: this.onMoved() } },
				})
			},

			setState(state) {
				console.log(state)
				this.board.set({...state});
			},

			onResize() {
				this.board.redrawAll();
			},

			history() {
				return this.game.history();
			},

		}
	};
</script>
