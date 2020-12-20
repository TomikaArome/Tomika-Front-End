<template>
	<div class="tomika-cards-player-game-info" :style="style" :class="{ hover: hover, 'current-player': currentPlayerId === player.id }">
		<div class="nickname" :style="{ color: colours[player.colour] }">{{ player.nickname }}</div>
		<div class="tricks-status">
			<span class="tricks-won"><span class="bold">{{ wonTricks }}</span> tricks</span>
			/
			<span class="bid"><span class="bold">3</span> bid</span>
		</div>
	</div>
</template>

<script>
	// Import dependencies
	import { mapState, mapGetters } from 'vuex';

	export default {
		name: "tomika-cards-player-game-info",
		props: {
			player: {
				type: Object,
				required: true
			}
		},
		data() {
			return {
				hover: false,
				componentWidth: 0,
				componentHeight: 0,
				componentTop: 0,
				componentLeft: 0
			};
		},
		computed: {
			...mapState('cards', ['currentPlayerId', 'cardGroups', 'colours']),
			...mapGetters('cards', ['playerCount', 'playerAngle', 'cardGroupCards']),
			style() {
				let playerAngleCos = Math.cos(this.playerAngle(this.player.id)), align = 'center';
				if (playerAngleCos < -0.4) { align = 'left'; }
				else if (playerAngleCos > 0.4) { align = 'right'; }
				return {
					'transform': `translate(calc(${this.pos.x}px - 50%), calc(${this.pos.y}px - 50%))`,
					'z-index': '1000000',
					'text-align': align
				}
			},
			pos() {
				let x = 0, y = 0;
				// Half the size of the screen
				const halfScreenWidth = this.$store.state.app.appWidth / 2;
				const halfScreenHeight = this.$store.state.app.appHeight / 2;
				const padding = 20;
				x = Math.min(Math.max(Math.cos(this.playerAngle(this.player.id)) * halfScreenWidth,
					-(halfScreenWidth - this.componentWidth / 2 - padding)),
					(halfScreenWidth - this.componentWidth / 2 - padding));
				y = Math.min(Math.max(-Math.sin(this.playerAngle(this.player.id)) * halfScreenHeight,
					-(halfScreenHeight - this.componentHeight / 2 - padding)),
					(halfScreenHeight - this.componentHeight / 2 - padding));
				return { x: x, y: y };
			},
			wonTricks() {
				const cardGroup = Object.values(this.cardGroups).find(cg => cg.role === 'wonTricks' && cg.playerId === this.player.id);
				if (cardGroup) {
					return Math.ceil(this.cardGroupCards(cardGroup.cardGroupId).length / this.playerCount);
				}
				return 0;
			}
		},
		methods: {
			updateComponentSize() {
				const boundingBox = this.$el.getBoundingClientRect();
				this.componentWidth = this.$el.clientWidth;
				this.componentHeight = this.$el.clientHeight;
				this.componentTop = boundingBox.top;
				this.componentLeft = boundingBox.left;
			},
			checkMousePos(event) {
				// Checking for mouse hover is necessary as we want to allow click events, and other events to pass
				// straight through this component but we still want the element to fade away when being hovered over
				// pointer-events unfortunately disables hover as well, meaning we have to do this roundabout solution
				const mouseX = event.clientX + document.body.scrollLeft, mouseY = event.clientY + document.body.scrollTop;
				// An extra margin is added to make the fading out of the element more user friendly
				const margin = 50;
				this.hover = mouseX >= this.componentLeft - margin && mouseX <= this.componentLeft + this.componentWidth + margin &&
					mouseY >= this.componentTop - margin && mouseY <= this.componentTop + this.componentHeight + margin;
			},
			// This method simply exists to make sure we remove the same method when destroying the component
			setHoverFalse() { this.hover = false; }
		},
		mounted() {
			this.$nextTick(this.updateComponentSize);
			document.addEventListener('mousemove', this.checkMousePos);
			document.addEventListener('mouseleave', this.setHoverFalse);
		},
		updated() { this.$nextTick(this.updateComponentSize); },
		destroyed() {
			document.removeEventListener('mousemove', this.checkMousePos);
			document.removeEventListener('mouseleave', this.setHoverFalse);
		}
	}
</script>

<style scoped>
.tomika-cards-player-game-info {
	position: absolute;
	top: 50%;
	left: 50%;
	padding: 12px 20px;
	border-radius: 8px;
	text-shadow: -1px 1px 1px hsl(0,0%,0%);
	background-color: hsla(0,0%,0%,0.7);
	transition: opacity 100ms;
}
.hover {
	opacity: 0;
}
.current-player {
	border: 4px solid hsla(200,80%,50%,0.5);
	background-color: hsla(200,30%,10%,0.7);
}
.nickname {
	font-size: 24px;
	font-weight: bold;
}
.tricks-status {
	font-size: 14px;
}
.bold {
	font-weight: bold;
	font-size: 20px;
}
</style>