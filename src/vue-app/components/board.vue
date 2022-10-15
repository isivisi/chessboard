<template>

		<div ref="board" id="board" class="board">

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

	import {Chessground} from 'chessground';

	import 'chessground/assets/chessground.base.css';
	import 'chessground/assets/chessground.brown.css';
	//import 'chessground/assets/chessground.cburnett.css';

	import '@/styles/pieces/staunty.css';

	import { Chess, SQUARES, validateFen } from 'chess.js';

	export default {
		name: "board",

		props: ['fen'],

		data() {
			return {
				game: null,
				board: null,
				observer: null,
				rules: true,
				history: [],
				orientation: 'white',
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
				},
				movable: {
					dests: this.possibleMoves(),
					showDests: true,
				}
			});
			
			//this.board.set(config);
			
			window.addEventListener('resize', this.onResize);
			//this.observer = new ResizeObserver(() => this.onResize(), this.$refs.boardwrapper);

			this.onResize();

			this.loadPosition("");

		},

		unmounted() {
			window.removeEventListener('resize', this.onResize);
		},

		watch: {
			 fen: function (newFen) {
				this.fen = newFen
				this.loadPosition(this.fen)
			},

			orientation: function(newOrientation) {
				 this.board.set({ orientation: newOrientation });
			},

			'board.state.drawable': {
				handler(value) {
					this.$emit('onDraw', this.board.state.drawable);
				},
				deep:true
			},
		
		},

		methods: {
			// https://github.com/vitogit/vue-chessboard/blob/5c7db9becbde32f0ad234453b0a70c95090d0d73/src/components/chessboard/index.vue#L53
			possibleMoves () {
				const dests = {
					get: function(value) { return this[value]; } // this is some kind of bug
				}
				SQUARES.forEach(s => {
					const ms = this.game.moves({square: s, verbose: true});
					if (ms.length) dests[s] = ms.map(m => m.to);
				})
				return dests;
			},

			// https://github.com/vitogit/vue-chessboard/blob/5c7db9becbde32f0ad234453b0a70c95090d0d73/src/components/chessboard/index.vue#L93
			calculatePromotions () {
				let moves = this.game.moves({verbose: true});
				var promotions = [];
				for (let move of moves) {
					if (move.promotion) {
						promotions.push(move);
					}
				}
				return promotions;
			},

			// https://github.com/vitogit/vue-chessboard/blob/5c7db9becbde32f0ad234453b0a70c95090d0d73/src/components/chessboard/index.vue#L102
			isPromotion(orig, dest) {
				let filteredPromotions = this.calculatePromotions().filter(move => move.from === orig && move.to === dest);
				return filteredPromotions.length > 0; // The current movement is a promotion
			},

			toColor () {
				return (this.game.turn() === 'w') ? 'white' : 'black'
			},

			onMoved() {
				return (orig, dest, metadata) => {

					var promoteTo = null;
					if (this.isPromotion(orig, dest)) {
						promoteTo = 'q';
					}

					var move = this.game.move({from: orig, to: dest, promotion: promoteTo});
					var gameHistory = this.game.history();

					if (this.rules) this.board.set({fen: this.game.fen()});

					this.board.set({
						turnColor: this.toColor(),
						movable: {
							color: this.rules ? this.toColor() : 'both',
							dests: this.possibleMoves(),
						},
					});

					if (!move && this.rules) return;

					if (this.rules) this.history.push(gameHistory[gameHistory.length - 1]);

					this.$emit('onMove', {
						history: this.history,
						fen: this.rules ? this.game.fen() : this.getBoardFen(),
						game: {
							gameOver: this.game.isGameOver(),
							inCheck: this.game.isCheck(),
							inCheckmate: this.game.isCheckmate(),
							inDraw: this.game.isDraw(),
							inRepitition: this.game.isThreefoldRepetition(),
						},
					});
				}
			},

			// load positional data for both Chess.js and Chessground
			loadPosition(fen) {
				this.game.load(fen);
				 this.board.set({
					fen: this.game.fen(),
					turnColor: this.toColor(),
					movable: {
						color: this.rules ? this.toColor() : 'both',
						dests: this.possibleMoves(),
					},
					orientation: this.orientation,
				});

				this.board.set({
					movable: { events: { after: this.onMoved() } },
				});
			},

			setState(state) {
				this.board.set(state);
			},

			// Fen from board state alone, not from chess.js
			getBoardFen() {
				return this.board.getFen() + ` ${this.game.turn()} KQkq - 0 1`;
			},

			setRulesEnabled(enabled) {
				var gameFen = this.getBoardFen();
				var validFen = validateFen(gameFen);
				
				if (!validFen.valid) {
					console.error(validFen);
					return;
				}

				this.rules = enabled;

				this.board.set({
					movable: {
						color: enabled ? this.toColor() : 'both',
						free: !enabled,
					}
				});

				// let chess.js know of changes and recalculate possible moves
				if (enabled) this.loadPosition(gameFen);

			},
			
			set(values) {
				this.board.set(values);
			},

			updateShapes(drawable) {
				this.board.state.drawable.shapes = drawable.shapes;
				this.board.state.drawable.current = drawable.current;
				this.board.redrawAll();
			},

			onResize() {
				this.board.redrawAll();
			},

			placePiece(piece) {
				this.game.put(piece, piece.position);
			}

		}
	};
</script>
