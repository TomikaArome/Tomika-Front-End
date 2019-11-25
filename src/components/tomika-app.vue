<template>
	<div id="app">
		<tomika-nav-bar></tomika-nav-bar>
		<tomika-nav-drawer></tomika-nav-drawer>
		<transition name="slide-fade">
			<tomika-discord-pane v-if="$store.state.nav.discordPaneOpen"></tomika-discord-pane>
		</transition>
		<transition name="slide-fade">
			<tomika-twitch-pane v-if="$store.state.nav.twitchPaneOpen"></tomika-twitch-pane>
		</transition>
		<component class="tomika-content" :is="contentComponent"></component>
		<div v-if="$store.state.app.popupStack.length" id="tomika-popup-stack">
			<div class="popup-screen" v-for="(popup, popupStackIndex) in $store.state.app.popupStack"
				:key="popupStackIndex" @click="clickPopupScreen(popup.noScreenClose, $event)">
				<tomika-popup :title="popup.title" :noTitle="popup.noTitle" :contentComponent="popup.contentComponent"
					:borderless="popup.borderless" :tabs="popup.tabs" :closeButtonAction="() => { $store.commit('app/popPopup'); }"
					:prompt="popup.prompt" :choices="popup.choices" :class="{ 'big-popup': popup.bigPopup }"></tomika-popup>
			</div>
		</div>
	</div>
</template>

<script>
	// Import components
	import tomikaNavBar from './tomika-nav-bar';
	import tomikaNavDrawer from './tomika-nav-drawer';
	import tomikaDiscordPane from './tomika-discord-pane';
	import tomikaTwitchPane from './tomika-twitch-pane';
	import tomikaContentIndex from './tomika-content-index';
	import tomikaPopup from './tomika-popup';
	import tomikaAdminSettings from './tomika-admin-settings';
	import tomikaGuildSettings from './tomika-guild-settings';

	// Import requests
	import { userInfoReq } from '../requests/user';
	import { infoReq } from '../requests/discordbot';

	export default {
		name: 'tomika-app',
		components: {
			tomikaNavBar,
			tomikaNavDrawer,
			tomikaDiscordPane,
			tomikaTwitchPane,
			tomikaContentIndex,
			tomikaPopup
		},
		data() {
			return {
				contentComponent: 'tomika-content-index'
			}
		},
		async mounted() {
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

			// Attempt to get user's information from Discord
			userInfoReq();

			// Create an event listener to be used to detect when a user has gone through Discord authorisation
			window.addEventListener('message', async (event) => {
				if (event.data && event.data.authSucceeded) {
					await userInfoReq();
				}
			});
		},
		methods: {
			positionPane(buttonId, paneId) {
				const button = document.querySelector('#' + buttonId);
				const pane = document.querySelector('#' + paneId);
				const windowWidth = (window.innerWidth || document.body.clientWidth);
				const chevronCentre = windowWidth - (button.offsetLeft + (button.offsetWidth / 2));
				const buttonCentre = chevronCentre - (pane.offsetWidth / 2);
				// Impose a minimum of 4 so that the pane is at least 4px off the right side of the window
				const right = Math.max(buttonCentre, 4);
				pane.style.right = right + 'px';
				pane.querySelector('.chevron').style.right = (chevronCentre - right) + 'px';
			},
			clickPopupScreen(noScreenClose, event) {
				if (!noScreenClose && /popup-screen/.test(event.target.className)) { this.$store.commit('app/popPopup'); }
			},
			async openSettings() {
				// Get bot details
				await infoReq();
				const botInfo = this.$store.state.discord.bot;
				// The user settings tab is always available
				let settingsTabs = [/*{
					spacer: true
				}*/];
				// Check if admin
				if (this.$store.state.discord.user.admin) {
					settingsTabs.push({
						image: botInfo.avatarUrl,
						contentComponent: {
							template: '<tomika-admin-settings></tomika-admin-settings>',
							components: { tomikaAdminSettings }
						}
					});
					settingsTabs.push({ spacer: true });
				}
				// Cycle through guilds and add a tab for each guild the user is a member of
				for (let i in botInfo.guilds.filter((guild) => { return guild.memberOf; })) {
					settingsTabs.push({
						image: botInfo.guilds[i].iconUrl,
						contentComponent: {
							template: '<tomika-guild-settings :guild="guild"></tomika-guild-settings>',
							components: { tomikaGuildSettings },
							data() { return { guild: botInfo.guilds[i] }; }
						}
					});
				}
				// Create popup object
				let settingsPopup = {
					title: 'Settings',
					bigPopup: true,
					tabs: settingsTabs
				};
				this.$store.commit('app/pushPopup', settingsPopup);
				this.$store.commit('nav/setDiscordPaneOpen', false);
			}
		}
	}
</script>

<style>
	@import url('https://fonts.googleapis.com/css?family=Roboto+Condensed&display=swap');
	html, body {
		margin: 0;
		padding: 0;
		min-width: 100vw;
		background-image: url('/images/stripes.png');
		background-color: hsl(0,0%,12%);
	}
	#app {
		font-family: 'Roboto Condensed', Arial, sans-serif;
		color: #ffffff;
		font-size: 14px;
	}
	::selection {
		background-color: hsla(180,100%,50%,0.2);
	}
	a, a:visited {
		color: hsl(180,50%,50%);
		text-decoration: none;
		transition: color 150ms;
	}
	a:hover {
		color: hsl(180,50%,65%);
	}
	h1, h2, h3, h4, h5, h6 {
		font-family: Splatoon2, "Roboto Condensed", Arial, sans-serif;
	}
	button {
		position: relative;
		color: #ffffff;
		border: none;
		border-radius: 8px;
		background-color: hsl(0,0%,25%);
		padding: 0.5em 1em;
		font-family: inherit;
		cursor: pointer;
		outline: none;
	}
	button:disabled {
		opacity: 0.5;
		cursor: default;
	}
	button:not(:disabled):after {
		content: "";
		pointer-events: none;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border-radius: 8px;
		background-color: #ffffff;
		opacity: 0;
		transition: opacity 150ms;
	}
	button.notFilled {
		border: 1px solid hsl(0,0%,25%);
		color: hsl(0,0%,25%);
		padding: calc(0.5em - 1px) calc(1em - 1px);
		background: transparent;
	}
	button.notFilled.red {
		border-color: hsl(0,40%,50%);
		color: hsl(0,40%,50%);
	}
	button:hover:after {
		opacity: 0.2;
	}
	hr {
		border: none;
		border-bottom: 1px solid hsl(0,0%,50%);
		margin: 16px 4px;
	}
	* {
		box-sizing: border-box;
	}
	.spacer {
		flex-grow: 1;
	}
	.tomika-pane {
		background-color: hsl(0,0%,10%);
		position: fixed;
		z-index: 1000000;
		top: 48px;
		right: 0;
		color: #ffffff;
		padding: 16px;
		border-radius: 8px;
		text-align: center;
		border: 1px solid hsl(180,25%,30%);
	}
	.tomika-pane > .chevron {
		fill: hsl(0,0%,10%);
		width: 6px;
		position: absolute;
		top: -6px;
		right: 50%;
		overflow: visible;
		stroke: hsl(180,25%,30%);
		stroke-width: 0.5;
	}
	.slide-fade-enter-active, .slide-fade-leave-active {
		transition: transform 150ms ease, opacity 150ms ease;
	}
	.slide-fade-enter, .slide-fade-leave-to {
		transform: translateY(4px);
		opacity: 0;
	}
	.tomika-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: absolute;
		top: 40px;
		width: 100%;
		min-height: calc(100% - 40px);
	}
	.tomika-column {
		width: 100%;
		max-width: 960px;
		padding: 20px;
	}
	#tomika-popup-stack {
		position: fixed;
		z-index: 999999;
		top: 40px;
		left: 0;
		width: 100%;
		height: calc(100% - 40px);
	}
	#tomika-popup-stack .popup-screen {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	#tomika-popup-stack .popup-screen:last-child {
		background-color: hsla(0,0%,0%,0.7);
	}
	@media (min-width: 501px) {
		.tomika-popup {
			max-width: 80%;
			max-height: 80%;
		}
	}
	@media (max-width: 500px) {
		#tomika-popup-stack .tomika-popup.big-popup {
			border: none;
			border-radius: 0;
			width: 100%;
			height: 100%;
		}
	}
	.big-popup {
		width: 60%;
		height: 70%;
	}
	@media (max-width: 700px) {
		.big-popup {
			width: 80%;
			height: 80%;
		}
	}
</style>
