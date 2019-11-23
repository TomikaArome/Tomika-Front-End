<template>
	<div id="tomika-twitch-pane" class="tomika-pane">
		<svg class="chevron" viewBox="0 0 3 3"><path d="M6 3l-3-3l-3 3"></path></svg>
		<div id="mini-twitch-player"></div>
		<template v-if="$store.state.twitch.activeStream !== null">
			<div class="image-row">
				<div><img class="box-art" :src="activeStream.game.box_art_url"></div>
				<div>
					<div class="status"><svg viewBox="0 0 1 1" class="notification" v-if="activeStream !== null">
						<path d="M-1 0a1 1 0 0 0 2 0a1 1 0 0 0-2 0z"></path>
						<path class="growingCircle" d="M-1 0a1 1 0 0 0 2 0a1 1 0 0 0-2 0z"></path>
					</svg>Currently live!</div>
					<div class="game"><span class="playing">Playing</span> {{ activeStream.game.name }}</div>
					<div class="title">{{ activeStream.title }}</div>
					<div><button class="watch-button" v-on:click="redirectToChannel">
						<font-awesome-icon :icon="['fab', 'twitch']"/>Watch on channel!
					</button></div>
				</div>
			</div>
		</template>
		<template v-else>
			<div class="status">Not currently live</div>
			<div class="info">You can usually catch me streaming on some evenings throughout the week, a mix of Splatoon
 (Usually Kemistry practice) and other games. Follow to be notified when I go live!</div>
			<div><button class="watch-button" v-on:click="redirectToChannel">
				<font-awesome-icon :icon="['fab', 'twitch']"/>Go to channel!
			</button></div>
		</template>
	</div>
</template>

<script>
	// Import dependencies
	import Vue from 'vue';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faTwitch } from '@fortawesome/free-brands-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

	// Import Twitch embed API
	import 'twitch-embed';

	// Font awesome
	library.add(faTwitch);
	Vue.component('font-awesome-icon', FontAwesomeIcon);

	export default {
		name: "tomika-twitch-pane",
		computed: {
			activeStream() { return this.$store.state.twitch.activeStream; }
		},
		mounted() {
			this.$parent.positionPane('tomika-nav-bar-twitch-button', 'tomika-twitch-pane');

			// Create the mini Twitch player
			/*const player = new Twitch.Player('mini-twitch-player', {
				width: 300,
				height: 400,
				channel: ''
			});*/
		},
		methods: {
			redirectToChannel() {
				window.open(this.$store.state.twitch.channelUrl, '_blank');
			}
		}
	};
</script>

<style scoped>
	#tomika-twitch-pane {
		max-width: 300px;
	}
	.image-row {
		display: flex;
		flex-direction: row;
		text-align: left;
	}
	.box-art {
		width: 70px;
		height: 96px;
		margin-right: 8px;
		border-radius: 4px;
		overflow: hidden;
	}
	.box-art > img {
		height: 100%;
	}
	.status {
		font-weight: bold;
		margin-bottom: 8px;
	}
	.game {
		font-size: 0.8em;
		color: hsl(0,0%,70%);
		margin: 4px 0px;
	}
	.playing {
		color: hsl(0,0%,40%);
	}
	.notification {
		width: 8px;
		overflow: visible;
		fill: hsl(0,50%,30%);
		transform: translateY(25%);
		margin: 0px 6px 0px 12px;
	}
	.growingCircle {
		fill: hsl(0,50%,60%);
		animation: liveCircle 2s infinite;
	}
	@keyframes liveCircle {
		0% { transform: scale(0); opacity: 1; }
		25% { opacity: 1; }
		50% { transform: scale(1); opacity: 0; }
		100% { transform: scale(1); opacity: 0; }
	}
	.watch-button {
		margin-top: 12px;
		background: hsl(261,43%,45%);
	}
	.watch-button > svg {
		margin-right: 6px;
	}
	.info {
		font-size: 0.8em;
		margin: 4px 0px;
		color: hsl(0,0%,70%);
	}
</style>