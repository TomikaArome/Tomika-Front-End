<template>
	<div id="tomika-nav-bar">
		<div id="tomika-nav-bar-nav-button" v-on:click="/*$store.commit('nav/setNavDrawerOpen')*/"
			:class="{ highlighted: $store.state.nav.navDrawerOpen }">
			<!--<font-awesome-icon icon="bars" class="bars" />-->
			<img :src="tomikaInkLogoUrl" alt="">
		</div>
		<div id="tomika-quick-navigation">

		</div>
		<div id="tomika-nav-bar-twitch-button" class="social-button" v-on:click="$store.commit('nav/setTwitchPaneOpen')"
			:class="{ highlighted: $store.state.nav.twitchPaneOpen }">
			<font-awesome-icon :icon="['fab', 'twitch']"/>
			<svg viewBox="0 0 1 1" class="notification" v-if="$store.state.twitch.activeStream !== null">
				<path d="M-1 0a1 1 0 0 0 2 0a1 1 0 0 0-2 0z"></path>
				<path class="growingCircle" d="M-1 0a1 1 0 0 0 2 0a1 1 0 0 0-2 0z"></path>
			</svg>
		</div>
		<a id="tomika-nav-bar-twitter-button" class="social-button" href="https://twitter.com/TomikaArome/"
			target="_blank">
			<font-awesome-icon :icon="['fab', 'twitter']"/>
			<svg viewBox="0 0 1 1" class="notification" v-if="$store.state.nav.unreadTweets">
				<path d="M-1 0a1 1 0 0 0 2 0a1 1 0 0 0-2 0z"></path>
			</svg>
		</a>
		<div id="tomika-nav-bar-discord-button" v-on:click="$store.commit('nav/setDiscordPaneOpen')"
			:class="{ highlighted: $store.state.nav.discordPaneOpen }" class="animatedDiscordPfpOnHover">
			<div v-if="$store.state.request.progress['/user/@me']">
				<div class="displayName">Connecting</div>
				<div class="tag">Please wait...</div>
			</div>
			<div v-else-if="$store.state.app.backEndUnreachable">
				<div class="displayName">Server unreachable</div>
				<div class="tag">Please try again later</div>
			</div>
			<div v-else-if="$store.getters['user/connected']">
				<div class="displayName">{{ $store.getters['user/name'] }}</div>
				<div class="tag">#{{ $store.getters['user/discriminator'] }}</div>
			</div>
			<div v-else>
				<div class="displayName">Not connected</div>
				<div class="tag">Connect here!</div>
			</div>
			<tomika-discord-pfp :discord-id="$store.getters['user/discordId']" :avatar="$store.getters['user/avatar']" />
		</div>
	</div>
</template>

<script>
	// Import dependencies
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faBars } from '@fortawesome/free-solid-svg-icons';
	import { faTwitch, faTwitter } from '@fortawesome/free-brands-svg-icons';

	// Import components
	import tomikaDiscordPfp from '../wrappers/tomika-discord-pfp';

	// Font awesome
	library.add(faBars, faTwitch, faTwitter);

	export default {
		name: "tomika-nav",
		components: {
			tomikaDiscordPfp
		},
		data() {
			return {
				tomikaInkLogoUrl: require('../../assets/images/tomika.ink.svg')
			}
		},
		mounted() {
			/**
			 * Function which checks if a mouse click was outside the specified ignore elements
			 * @param ignoreArr Array of IDs that when the associated element is pressed, the pane will not be closed
			 * @param action Function which will trigger if none of the elements specified in the array were clicked on
			 */
			const clickOutPaneCheck = (ignoreArr, action) => {
				window.addEventListener('click', (e) => {
					let target = e.target;
					while (typeof target === 'object' && target !== null && target.tagName !== 'HTML') {
						if (ignoreArr.indexOf(target.id) !== -1) { return; }
						target = target.parentNode;
					}
					action();
				});
			};
			// Set it so that when different panes are clicked out of, they close
			clickOutPaneCheck(['tomika-nav-drawer', 'tomika-nav-bar-nav-button'], () => {
				this.$store.commit('nav/setNavDrawerOpen', false);
			});
			clickOutPaneCheck(['tomika-discord-pane', 'tomika-nav-bar-discord-button'], () => {
				this.$store.commit('nav/setDiscordPaneOpen', false);
			});
			clickOutPaneCheck(['tomika-twitch-pane', 'tomika-nav-bar-twitch-button'], () => {
				this.$store.commit('nav/setTwitchPaneOpen', false);
			});
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
		border-bottom: 1px solid hsl(180,25%,30%);
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
		margin: 0 4px;
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