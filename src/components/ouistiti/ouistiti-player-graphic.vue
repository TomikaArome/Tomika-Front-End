<template>
	<div class="ouistiti-player-graphic" :class="colour.toLowerCase()" :style="style">
		<font-awesome-icon :icon="icon"></font-awesome-icon>
	</div>
</template>

<script>
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faHeart } from '@fortawesome/free-solid-svg-icons';
	library.add(faHeart);
	export default {
		name: "ouistiti-player-graphic",
		props: {
			colour: {
				type: String,
				validator: (val) => {
					return ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'white', 'black'].indexOf(val.toLowerCase()) > -1;
				},
				default: 'white'
			},
			id: String,
			small: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			icon() {
				if (!this.id) { return ['fa-tomika', 'spade']; }
				let r = ['fa-tomika', 'spade'];
				switch (Math.abs(this.id.charCodeAt(this.id.length - 1) % 4)) {
					case 0: r = ['fa-tomika', 'spade']; break;
					case 1: r = 'heart'; break;
					case 2: r = ['fa-tomika', 'club']; break;
					case 3: r = ['fa-tomika', 'diamond']; break;
				}
				return r;
			},
			style() {
				return {
					width: (this.small ? 35 : 50) + 'px',
					height: (this.small ? 35 : 50) + 'px',
					fontSize: (this.small? 16 : 24) + 'px'
				}
			}
		}
	}
</script>

<style scoped>
.ouistiti-player-graphic {
	border-radius: 8px;
	width: 50px;
	height: 50px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: hsla(0,0%,100%,0.5);
	font-size: 20px;
}
.red { background-color: hsl(0,75%,60%); }
.yellow { background-color: hsl(60,75%,60%); }
.green { background-color: hsl(120,75%,60%); }
.cyan { background-color: hsl(180,75%,60%); }
.blue { background-color: hsl(240,75%,60%); }
.magenta { background-color: hsl(300,50%,60%); }
.white { background-color: hsl(0,0%,60%); }
.black { background-color: hsl(0,0%,20%); }
</style>