<template>
	<div id="tomika-cards-acknowledgement" :class="{ hidden: acknowledgementRemainingPlayerIds.length === 0 }">
		<div class="title-text" v-if="acknowledgementTitle">{{ acknowledgementTitle }}</div>
		<div class="buttons-row">
			<template v-if="acknowledgementIdentifier === 'bid'">
				<button v-for="i in (maxBid + 1)" @click="acknowledge(i - 1)" :key="i" class="numberSelect"
					:style="{ 'background-color': selfColour }" :disabled="selfHasAcknowledged">{{ (i - 1) }}</button>
			</template>
			<button v-else @click="acknowledge" :disabled="selfHasAcknowledged">Next</button>
		</div>
		<div class="waiting-for">Waiting for:</div>
		<div>
			<tomika-cards-player-graphic v-for="player in players" :key="player.id" :colour="player.colour" :id="player.id"
				:small="true" :style="{ opacity: acknowledgementRemainingPlayerIds.indexOf(player.id) === -1 ? '0.2' : '1' }"></tomika-cards-player-graphic>
		</div>
	</div>
</template>

<script>
	// Import dependencies
	import { mapState, mapMutations } from 'vuex';
	import TomikaCardsPlayerGraphic from "./tomika-cards-player-graphic";

	export default {
		name: "tomika-cards-acknowledgement",
		components: {TomikaCardsPlayerGraphic},
		computed: {
			...mapState('cards', ['socket', 'players', 'selfId', 'acknowledgementIdentifier', 'acknowledgementRemainingPlayerIds', 'acknowledgementTitle', 'colours', 'maxBid', 'bids']),
			selfHasAcknowledged() {
				return this.acknowledgementRemainingPlayerIds.indexOf(this.selfId) === -1;
			},
			selfColour() {
				if (!this.players[this.selfId]) { return 'hsl(0,0%,0%)'; }
				let colour = this.colours[this.players[this.selfId].colour].replace(/^hsl\(([0-9]+),([0-9]+)%,([0-9]+)%\)/i, 'hsl($1,$2%,20%)');
				if (this.players[this.selfId].colour === 'black') { colour = 'hsl(0,0%,0%)'; }
				return colour;
			}
		},
		methods: {
			...mapMutations('cards', ['setBids']),
			acknowledge(bid) {
				let bidEmitObj = {};
				if (typeof bid === 'number') {
					bidEmitObj = { bid: bid };
					const mutationObj = this.bids;
					mutationObj[this.selfId] = bid;
					this.setBids(mutationObj);
				}
				this.socket.emit('gameEvent', { gameEventType: 'acknowledge', ...bidEmitObj });
			}
		}
	}
</script>

<style scoped>
#tomika-cards-acknowledgement {
	max-width: 275px;
	display: flex;
	flex-direction: column;
	place-items: center;
	justify-content: center;
	position: absolute;
	bottom: 0;
	left: 50px;
	z-index: 2;
	pointer-events: none;
	background-color: hsla(200,30%,10%,0.9);
	border: 4px solid hsla(200,50%,0%,0.3);
	border-top-left-radius: 8px;
	border-top-right-radius: 8px;
	border-bottom: none;
	padding: 20px 32px;
	transition: transform 200ms;
}
#tomika-cards-acknowledgement.hidden {
	transform: translateY(100%);
}
.title-text {
	margin-bottom: 8px;
}
.buttons-row {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	place-items: center;
}
button {
	position: relative;
	font-size: 20px;
	pointer-events: auto;
	width: 100px;
	height: 100px;
	border-radius: 100%;
	background-color: hsla(200,30%,20%,0.9);
	border: 2px solid hsla(0,30%,100%,0.5);
	text-shadow: -1px 1px 1px hsl(0,0%,0%);
}
button:before {
	content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='hsla(0,0%25,100%25,0.2)'%3E%3Cpath d='M50 2a48 48 0 0 0 0 96a48 48 0 0 0 0-96v2a46 46 0 0 1 0 92a46 46 0 0 1 0-92z' /%3E%3C/svg%3E");
	position: absolute;
	top: 0; left: 0;
	width: 100%; height: 100%;
}
.numberSelect {
	width: 50px;
	height: 50px;
	padding: 8px;
	margin-right: -10px;
	transform: translateX(-10%);
}
.numberSelect:first-child {
	background-color: hsl(0,0%,0%) !important;
	border-style: dashed;
}
.waiting-for {
	margin-top: 20px;
	font-weight: bold;
	color: hsl(0,0%,80%);
}
.waiting-for + div {
	display: flex;
	flex-direction: row;
	margin-top: 8px;
}
.waiting-for + div > *:not(:last-child) {
	margin-right: 4px;
}
</style>