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
		<tomika-popup-stack></tomika-popup-stack>
	</div>
</template>

<script>
	// Import dependencies
	import '../fa.js';

	// Import components
	import tomikaNavBar from './nav/tomika-nav-bar';
	import tomikaNavDrawer from './nav/tomika-nav-drawer';
	import tomikaPopupStack from './tomika-popup-stack';
	import tomikaDiscordPane from './nav/tomika-discord-pane';
	import tomikaTwitchPane from './nav/tomika-twitch-pane';

	// Import content components
	import tomikaContent404 from './content/tomika-content-404';
	import tomikaContentUnauthorized from './content/tomika-content-unauthorized';
	import tomikaContentIndex from './index/tomika-content-index';
	import tomikaContentStreamControl from './stream-control/tomika-content-stream-control';
	import tomikaContentAdmin from './admin/tomika-content-admin';
	import tomikaContentUser from './user/tomika-content-user';
	import tomikaContentOuistiti from './ouistiti/tomika-content-ouistiti';

	// Import requests
	import { userInfoReq } from '../requests/user';

	export default {
		name: 'tomika-app',
		components: {
			tomikaNavBar,
			tomikaNavDrawer,
			tomikaPopupStack,
			tomikaDiscordPane,
			tomikaTwitchPane,
			// Content components
			tomikaContent404,
			tomikaContentUnauthorized,
			tomikaContentIndex,
			tomikaContentStreamControl,
			tomikaContentAdmin,
			tomikaContentUser,
			tomikaContentOuistiti
		},
		data() {
			return {}
		},
		computed: {
			contentComponent() {
				if (!this.$store.state.nav.content) { return 'div'; }
				// Get the component name from the store
				const o = this.$store.state.nav.content;
				let r = o.component;
				// Check the component specified by the store exists
				let found = false;
				for (let i in this.$options.components) {
					if (found) { break; }
					if (this.$options.components[i].name === o.component) { found = true; }
				}
				if (!found) {
					r = { template: `<div>Component "${o.component}" not registered</div>` };
				}
				// Check the user has the permission to view the content
				if (typeof o.auth === 'string') {
					if (!this.$store.getters['user/hasPermission'](o.auth)) { r = 'tomika-content-unauthorized'; }
				} else if (typeof o.auth === 'function') {
					if (!o.auth(this.$store)) { r = 'tomika-content-unauthorized'; }
				}
				// Return
				return r;
			}
		},
		async mounted() {
			// Attempt to get user and bot's information from Discord
			userInfoReq();

			// Create an event listener to be used to detect when a user has gone through Discord authorisation
			window.addEventListener('message', async (event) => {
				if (event.data && event.data.authSucceeded) {
					await userInfoReq();
					this.$store.commit('nav/setDiscordPaneOpen', false);
				}
			});

			// Check the pathname
			await this.$store.dispatch('nav/switchContent', {
				pathname: window.location.pathname,
				pushState: false
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
	border: 1px solid hsl(0,0%,35%);
	color: hsl(0,0%,60%);
	padding: calc(0.5em - 1px) calc(1em - 1px);
	background: transparent !important;
}
button.notFilled.red {
	border-color: hsl(0,40%,35%);
	color: hsl(0,40%,60%);
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
button > svg {
	margin-right: 0.5em;
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

/*---------------------*
 | Transition elements |
 *---------------------*/

.page-slide-left-enter-active, .page-slide-left-leave-active { transition: transform 200ms ease, opacity 200ms ease; }
.page-slide-left-enter { transform: translateX(50%); opacity: 0; }
.page-slide-left-leave-to { transform: translateX(-50%); opacity: 0; }
.page-slide-right-enter-active, .page-slide-right-leave-active { transition: transform 200ms ease, opacity 200ms ease; }
.page-slide-right-enter { transform: translateX(-50%); opacity: 0; }
.page-slide-right-leave-to { transform: translateX(50%); opacity: 0; }

</style>
