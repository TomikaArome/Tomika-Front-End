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
		<div v-if="$store.state.nav.settingsOpen || $store.state.app.popupStack.length" id="tomika-popup-stack">
			<div v-if="$store.state.nav.settingsOpen" class="popup-screen"
				@click="clickPopupScreen(() => {$store.commit('nav/setSettingsOpen', false)}, $event)">
				<tomika-settings class="big-popup"></tomika-settings>
			</div>
			<div class="popup-screen" v-for="(popup, popupStackIndex) in $store.state.app.popupStack"
				:key="popupStackIndex" @click="clickPopupScreen(!popup.noScreenClose, $event)">
				<component :is="popup.popupComponent" :class="{ 'big-popup': popup.bigPopup }"></component>
			</div>
		</div>
	</div>
</template>

<script>
	// Import dependencies
	import Vue from 'vue';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

	// Import components
	import tomikaNavBar from './nav/tomika-nav-bar';
	import tomikaNavDrawer from './nav/tomika-nav-drawer';
	import tomikaDiscordPane from './nav/tomika-discord-pane';
	import tomikaTwitchPane from './nav/tomika-twitch-pane';
	import tomikaSettings from './settings/tomika-settings';

	// Import content components
	import tomikaContentIndex from './index/tomika-content-index';
	import tomikaContentStreamControl from './stream-control/tomika-content-stream-control';
	import tomikaContentAdmin from './admin/tomika-content-admin';
	import tomikaContentDb from './db/tomika-content-db';

	// Import requests
	import { userInfoReq } from '../requests/user';
	import { infoReq as botInfoReq } from '../requests/discordbot';

	// Font awesome
	Vue.component('font-awesome-icon', FontAwesomeIcon);

	export default {
		name: 'tomika-app',
		components: {
			tomikaNavBar,
			tomikaNavDrawer,
			tomikaDiscordPane,
			tomikaTwitchPane,
			tomikaSettings,
			// Content components
			tomikaContentIndex,
			tomikaContentStreamControl,
			tomikaContentAdmin,
			tomikaContentDb
		},
		data() {
			return {}
		},
		computed: {
			contentComponent() {
				if (!this.$store.state.nav.content) { return 'div'; }
				// Get the component name from the store
				const compName = this.$store.state.nav.content.component;
				// Check the component specified by the store exists
				let found = false;
				for (let i in this.$options.components) {
					if (found) { break; }
					if (this.$options.components[i].name === compName) { found = true; }
				}
				// Return the component name
				return found ? compName : { template: `<div>Component "${compName}" not registered</div>` };
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

			// Attempt to get user and bot's information from Discord
			userInfoReq();
			botInfoReq();

			// Create an event listener to be used to detect when a user has gone through Discord authorisation
			window.addEventListener('message', async (event) => {
				if (event.data && event.data.authSucceeded) {
					await userInfoReq();
				}
			});

			// Check the pathname
			this.$store.dispatch('nav/switchContent', { pathname: window.location.pathname, handleErrors: true, pushState: false });
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
			clickPopupScreen(screenAction, event) {
				if (screenAction && /popup-screen/.test(event.target.className)) {
					if (typeof screenAction === "function") { screenAction(); }
					else { this.$store.commit('app/popPopup'); }
				}
			}
		}
	}
</script>

<style>

/*--------*
 | Import |
 *--------*/

@import url('https://fonts.googleapis.com/css?family=Roboto+Condensed&display=swap');

/*-----------*
 | Base tags |
 *-----------*/

html, body {
	margin: 0;
	padding: 0;
	min-width: 100vw;
	min-height: 100vh;
	background-image: url('/images/stripes.png');
	background-color: hsl(0,0%,12%);
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
	background-color: hsl(0,0%,15%);
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
	border-radius: inherit;
	background-color: #ffffff;
	opacity: 0;
	transition: opacity 150ms;
}
button.notFilled {
	border: 1px solid hsl(0,0%,25%);
	color: hsl(0,0%,50%);
	padding: calc(0.5em - 1px) calc(1em - 1px);
	background: transparent !important;
}
button.notFilled.red {
	border-color: hsl(0,40%,25%);
	color: hsl(0,40%,40%);
}
button.red {
	background-color: hsl(0,20%,25%);
	color: hsl(0,50%,75%);
}
button.green {
	background-color: hsl(90,20%,25%);
	color: hsl(90,50%,75%);
}
button:hover:after {
	opacity: 0.05;
}
input[type=text], input[type=number], input[type=password], textarea {
	font-family: inherit;
	font-size: 0.9em;
	background: hsla(0,0%,100%,0.8);
	border: 1px solid hsl(0,0%,30%);
	border-radius: 4px;
	padding: 4px 8px;
	outline: none;
	resize: none;
}
hr {
	border: none;
	border-bottom: 1px solid hsl(0,0%,50%);
	margin: 16px 4px;
}
* {
	box-sizing: border-box;
}

/*------------*
 | Scrollbars |
 *------------*/

::-webkit-scrollbar {
	width: 10px;
	height: 10px;
}
::-webkit-scrollbar-track {
	background: hsla(0,0%,15%,1);
}
::-webkit-scrollbar-thumb {
	background: hsla(0,0%,25%,1);
	border-radius: 10px;
	padding: 1px;
	border: 2px solid hsla(0,0%,15%,1);
	transition: background 100ms;
}
::-webkit-scrollbar-thumb:hover {
	background: hsla(0,0%,35%,1);
}
::-webkit-scrollbar-corner {
	background: hsla(0,0%,15%,1);
}

/*-------*
 | Other |
 *-------*/

#app {
	font-family: 'Roboto Condensed', Arial, sans-serif;
	color: #ffffff;
	font-size: 14px;
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
	#tomika-popup-stack *.big-popup {
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
