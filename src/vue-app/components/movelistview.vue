<template>

		<div>
			moves:
			<div class="movelistview" ref="list" bg-variant="dark" text-variant="white">

					<template v-if="boardStates[boardStates.length-1]">
						<span v-for="(move, i) in boardStates[boardStates.length-1].history" v-bind:key="i">
							<b-badge size="sm" @click="moveSelected(move)" class="movebadge" :variant=" i % 2 ? '' : 'light'">
								{{move}}
							</b-badge>
							<b-icon-arrow-right-short v-if="i != boardStates.length-1" style="margin-left:-10px"></b-icon-arrow-right-short>
						</span>
					</template>
			</div>
		</div>

</template>

<style>
	.movelistview {
		width: 100%;
		max-height:25vh;
		overflow-y: scroll;
	}

	.movelistview::-webkit-scrollbar {
		display: none;
	}

	.movebadge {
		margin-right: 5px;
	}

	.controls {
		margin-left: auto;
		margin-right: auto;
		width:100%;
	}
</style>

<script>

	import {Chessground} from 'chessground';

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
				this.boardStates.push(state);
				this.scrollDown();
			},

			setBoardStates(states) {
				this.boardStates = states;
				this.scrollDown();
			},

			scrollDown() {
				this.$refs.list.scrollTop = this.$refs.list.scrollHeight;
			},

			moveSelected(move) {
				this.emit('moveSelected', move);
			},

		}
	};
</script>
