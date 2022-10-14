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
					opacity: 0,
				},

				showTimeout: null,
			}
		},

		mounted() {



		},

		methods: {

			setMousePos(position) {
				this.mouselocation.left = position.x;
				this.mouselocation.top = position.y;

				clearTimeout(this.showTimeout);
				this.mouselocation.opacity = 1;
				this.showTimeout = setTimeout(() => this.mouselocation.opacity = 0, 1000);
			}

		}
	};
</script>
