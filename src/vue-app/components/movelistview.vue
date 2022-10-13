<template>

		<div>
			<h5> moves: </h5>
			<div class="movelistview" bg-variant="dark" text-variant="white">
					<b-badge @click="moveSelected(move)" class="movebadge" v-for="(move, i) in boardStates" v-bind:key="i" :variant=" i % 2 ? '' : 'light'">
						{{i % 2 ? '' : Math.ceil((i+0.5)/2) + ':'}} {{move.history[move.history.length -1]}}
					</b-badge>
			</div>
		</div>

</template>

<style>
	.movelistview {
		width: 100%;
	}

	.movebadge {
		margin-right: 5px;
	}
</style>

<script>

	import {Chessground} from 'chessground';
	//import 'vue-chessboard/dist/vue-chessboard.css';

	import { Chess, SQUARES } from 'chess.js';

	export default {
		name: "movelistview",

		data() {
			return {
				boardStates: [],
			}
		},

		mounted() {


		},

		methods: {

			addState(state) {
				this.boardStates.push(state)
			},

			moveSelected(move) {
				this.emit('moveSelected', move);
			},

		}
	};
</script>
