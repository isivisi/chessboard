<template>

		<div>
			<b-icon-mouse-fill v-show="show" class="remotemouse" :style="mouselocation" variant="info" scale="2"></b-icon-mouse-fill>
		</div>

</template>

<style>
	.remotemouse {
		position: absolute !important;
		z-index: 9999;
	}
</style>

<script>

	export default {
		name: "remotemouse",

		data() {
			return {
				mouselocation: {
					top: 0,
					left: 0
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
						this.showTimeout = setTimeout(() => this.show = false, 1000);
					}

				});
			}

		}
	};
</script>
