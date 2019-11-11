<template>
	<div id="app">
		<tomika-nav-bar></tomika-nav-bar>
		<tomika-discord-pane></tomika-discord-pane>
		<tomika-nav-pane></tomika-nav-pane>
	</div>
</template>

<script>
import tomikaNavBar from './tomika-nav-bar';
import tomikaDiscordPane from './tomika-discord-pane';
import tomikaNavPane from './tomika-nav-pane';

export default {
	name: 'tomika-app',
	components: {
		tomikaNavBar,
		tomikaDiscordPane,
		tomikaNavPane
	}
}
</script>

<style>
	html, body {
		margin: 0px;
		padding: 0px;
		min-width: 100vw;
		min-height: 100vh;
	}
	#app {
		font-family: Splatoon2, Arial, sans-serif;
	}
</style>
