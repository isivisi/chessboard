<template>

		<div>
			<b-icon-mouse-fill class="remotemouse" :style="mouselocation" variant="info" scale="2"></b-icon-mouse-fill>
		</div>

</template>

<style>
	.remotemouse {
		position: absolute !important;
		z-index: 9999;
		transition: opacity 1s;
	}
</style>

<script>

	export default {
		name: "remotemouse",

		props: [
			'board',
		],

		data() {
			return {
				mouselocation: {
					top: 0,
					left: 0,
					opacity: 1,
				},

				showTimeout: null,
			}
		},

		mounted() {



		},

		methods: {

			setConnection(connection) {
				console.log("setting mouse connection");
				connection.on('data', (data) => {

					//console.log(data)

					if (data.mouse) {
						// this only works because the aspect ratio is locked
						var board = document.getElementById('board');
						this.mouselocation.left = (this.board.orientation  === 'white' ? (data.mouse.x * board.clientHeight) : board.clientHeight - (data.mouse.x * board.clientHeight)) + 'px';
						this.mouselocation.top = (this.board.orientation  === 'white' ? (data.mouse.y * board.clientHeight) : board.clientWidth - (data.mouse.y * board.clientHeight)) + 'px';

						clearTimeout(this.showTimeout);
						this.mouselocation.opacity = 1;
						this.showTimeout = setTimeout(() => this.mouselocation.opacity = 0, 1000);
					}

				});
			}

		}
	};
</script>
