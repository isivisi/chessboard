<template>

		<div>
			<b-icon-mouse-fill v-show="show" class="remotemouse" :style="mouselocation" variant="info" scale="2"></b-icon-mouse-fill>
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

		data() {
			return {
				mouselocation: {
					top: 0,
					left: 0,
					opacity: 1,
				},

				show:false,
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
						this.mouselocation.left = (data.mouse.x * window.innerHeight) + 'px';
						this.mouselocation.top = (data.mouse.y * window.innerWidth) + 'px';

						clearTimeout(this.showTimeout);
						this.show = true;
						this.mouselocation.opacity = 1;
						this.showTimeout = setTimeout(() => this.mouselocation.opacity = 0.1, 1000);
					}

				});
			}

		}
	};
</script>
