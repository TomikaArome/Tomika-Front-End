<template>
	<div id="tomika-nav-bar">
		<div id="tomika-nav-bar-nav-button" v-on:click="/*$store.commit('nav/setNavDrawerOpen')*/"
			:class="{ highlighted: $store.state.nav.navDrawerOpen }">
			<!--<font-awesome-icon icon="bars" class="bars" />-->
			<img :src="tomikaInkLogoUrl">
		</div>
		<div id="tomika-quick-navigation">

		</div>
		<div id="tomika-nav-bar-twitch-button" class="social-button" v-on:click="$store.commit('nav/setTwitchPaneOpen')"
			:class="{ highlighted: $store.state.nav.twitchPaneOpen }">
			<font-awesome-icon :icon="['fab', 'twitch']"/>
			<svg viewBox="0 0 1 1" class="notification" v-if="$store.state.twitch.activeStream !== null">
				<path d="M-1 0a1 1 0 0 0 2 0a1 1 0 0 0-2 0z" />
				<path class="growingCircle" d="M-1 0a1 1 0 0 0 2 0a1 1 0 0 0-2 0z" />
			</svg>
		</div>
		<a id="tomika-nav-bar-twitter-button" class="social-button" href="https://twitter.com/TomikaArome/"
			target="_blank">
			<font-awesome-icon :icon="['fab', 'twitter']"/>
			<svg viewBox="0 0 1 1" class="notification" v-if="$store.state.nav.unreadTweets">
				<path d="M-1 0a1 1 0 0 0 2 0a1 1 0 0 0-2 0z" />
			</svg>
		</a>
		<div id="tomika-nav-bar-discord-button" v-on:click="$store.commit('nav/setDiscordPaneOpen')"
			:class="{ highlighted: $store.state.nav.discordPaneOpen }" class="animatedDiscordPfpOnHover">
			<div v-if="$store.state.app.backEndUnreachable">
				<div class="displayName">Server unreachable</div>
				<div class="tag">Please try again later</div>
			</div>
			<div v-else-if="$store.getters['discord/connected']">
				<div class="displayName">{{ $store.state.discord.user.username }}</div>
				<div class="tag">#{{ $store.state.discord.user.discriminator }}</div>
			</div>
			<div v-else>
				<div class="displayName">Not connected</div>
				<div class="tag">Connect here!</div>
			</div>
			<tomika-discord-pfp />
		</div>
	</div>
</template>

<script>
	// Import dependencies
	import Vue from 'vue';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faBars } from '@fortawesome/free-solid-svg-icons';
	import { faTwitch, faTwitter } from '@fortawesome/free-brands-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
	import { wait } from '../util';

	// Import components
	import tomikaDiscordPfp from './tomika-discord-pfp';

	// Font awesome
	library.add(faBars, faTwitch, faTwitter);
	Vue.component('font-awesome-icon', FontAwesomeIcon);

	export default {
		name: "tomika-nav",
		components: {
			tomikaDiscordPfp
		},
		data() {
			return {
				tomikaInkLogoUrl: require('../assets/images/tomika.ink.svg'),
				discordPfpUrl: require('../assets/images/discordDefaultPfp.png')
			}
		},
		created() {
			this.updateTwitchStatus(this.$store.state.twitch.updateFrequency);
		},
		methods: {
			/**
			 * Method which updates the status of the twitch stream
			 * @param timeUntilNextUpdate Time in milliseconds until the next update is performed
			 */
			async updateTwitchStatus(timeUntilNextUpdate) {
				// Set the headers for the requests
				const headers = {
					'Accept': 'application/json',
					'Client-Id': this.$store.state.twitch.apiClientId
				};
				// Request the Twitch API for the status of the stream
				const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${this.$store.state.twitch.userName}`,
					{ headers }).catch(() => {
					this.$store.commit('twitch/setActiveStream');
				});
				if (response.ok) {
					const res = await response.json();
					if (res.data[0]) {
						// Get game data
						const response2 = await fetch(`https://api.twitch.tv/helix/games?id=${res.data[0].game_id}`,
							{ headers }).catch(() => {
							this.$store.commit('twitch/setActiveStream');
						});
						if (response2.ok) {
							const res2 = await response2.json();
							res2.data[0].box_art_url = res2.data[0].box_art_url.replace(/{width}/, '138')
								.replace(/{height}/, '190');
							res.data[0].game = res2.data[0];
							this.$store.commit('twitch/setActiveStream', res.data[0]);
						}
					} else {
						this.$store.commit('twitch/setActiveStream');
					}
					if (typeof timeUntilNextUpdate === "number" && timeUntilNextUpdate >= 100) {
						await wait(timeUntilNextUpdate);
						this.updateTwitchStatus(timeUntilNextUpdate);
					}
				} else {
					this.$store.commit('twitch/setActiveStream');
				}
			}
		}
	};
</script>

<style scoped>
	#tomika-nav-bar {
		position: fixed;
		color: #ffffff;
		background: hsla(0,0%,5%,1);
		width: 100%;
		height: 40px;
		display: flex;
		flex-direction: row;
		align-items: center;
		user-select: none;
		z-index: 1000000;
	}
	a, a:visited {
		color: inherit;
	}
	#tomika-nav-bar > div, #tomika-nav-bar > a {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 6px;
		height: 100%;
		box-sizing: border-box;
	}
	#tomika-nav-bar-nav-button {
		transition: background-color 200ms;
		/*cursor: pointer;*/
	}
	#tomika-nav-bar-nav-button > img {
		height: 24px;
	}
	.bars {
		font-size: 1.2em;
		color: hsl(0,0%,50%);
		margin-right: 10px;
		margin-left: 4px;
	}
	#tomika-quick-navigation {
		flex-grow: 1;
	}
	img {
		height: 100%;
	}
	#tomika-nav-bar-discord-button {
		display: flex;
		flex-direction: row;
		align-items: center;
		cursor: pointer;
		transition: background-color 200ms;
	}
	#tomika-nav-bar-discord-button:hover, /*#tomika-nav-bar-nav-button:hover,*/ .social-button:hover, .highlighted {
		background-color: hsla(0,0%,100%,0.1);
	}
	.displayName, .tag {
		display: flex;
		flex-direction: column;
		text-align: right;
		margin-right: 6px;
		margin-left: 4px;
	}
	.displayName {
		font-size: 0.8em;
	}
	.tag {
		font-size: 0.6em;
		color: hsl(0,0%,50%);
	}
	#tomika-nav-bar-discord-button img {
		border-radius: 100%;
	}
	.social-button {
		position: relative;
		font-size: 1.2em;
		color: hsl(0,0%,70%);
		cursor: pointer;
		transition: background-color 200ms;
	}
	.social-button > svg:not(.notification) {
		margin: 0px 4px;
	}
	.social-button > .notification {
		width: 5px;
		overflow: visible;
		position: absolute;
		top: 28px;
		left: 28px;
	}
	#tomika-nav-bar-twitch-button > .notification {
		fill: hsl(0,50%,30%);
	}
	#tomika-nav-bar-twitter-button > .notification {
		fill: hsl(200,50%,50%);
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
</style>