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

	</div>
</template>

<script>
	// Import components
	import tomikaNavBar from './tomika-nav-bar';
	import tomikaNavDrawer from './tomika-nav-drawer';
	import tomikaDiscordPane from './tomika-discord-pane';
	import tomikaTwitchPane from './tomika-twitch-pane';

	export default {
		name: 'tomika-app',
		components: {
			tomikaNavBar,
			tomikaNavDrawer,
			tomikaDiscordPane,
			tomikaTwitchPane
		},
		created() {
			/**
			 * Function which checks if a mouse click was outside the specified ignore elements
			 * @param ignoreArr Array of IDs that when the associated element is pressed, the pane will not be closed
			 * @param action Function which will trigger if none of the elements specified in the array were clicked on
			 */
			const clickOutPaneCheck = (ignoreArr, action) => {
				window.addEventListener('click', (e) => {
					let target = e.target;
					while (target.tagName !== 'HTML') {
						if (ignoreArr.indexOf(target.id) !== -1) { return; }
						target = target.parentNode;
					}
					action();
				});
			}
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
	@import url('https://fonts.googleapis.com/css?family=Roboto+Condensed&display=swap');
	html, body {
		margin: 0;
		padding: 0;
		min-width: 100vw;
		min-height: 100vh;
	}
	a, a:visited {
		color: inherit;
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
	button:after {
		content: "";
		pointer-events: none;
		position: absolute;
		top: 0px;
		left: 0px;
		width: 100%;
		height: 100%;
		border-radius: 8px;
		background-color: #ffffff;
		opacity: 0;
		transition: opacity 150ms;
	}
	button:hover:after {
		opacity: 0.2;
	}
	#app {
		font-family: 'Roboto Condensed', Arial, sans-serif;
	}
	* {
		box-sizing: border-box;
	}
	.tomika-pane {
		background-color: hsl(0,0%,10%);
		position: fixed;
		top: 48px;
		right: 0px;
		color: #ffffff;
		padding: 16px;
		border-radius: 8px;
		text-align: center;
	}
	.tomika-pane > .chevron {
		fill: hsl(0,0%,10%);
		width: 12px;
		position: absolute;
		top: -6px;
		right: 50%;
		overflow: visible;
	}
	.slide-fade-enter-active, .slide-fade-leave-active {
		transition: transform 150ms ease, opacity 150ms ease;
	}
	.slide-fade-enter, .slide-fade-leave-to {
		transform: translateY(4px);
		opacity: 0;
	}
</style>
