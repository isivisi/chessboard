<template>

		<div>
			<span v-for="move in boardStates">
				{{move.history[move.history.length -1]}}
			</span>
		</div>

</template>

<style>

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
			}

		}
	};
</script>
