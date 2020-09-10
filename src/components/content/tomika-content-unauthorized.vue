<template>
	<div id="tomika-content-unauthorized">
		<div>You don't have the permission to access this content</div>
		<div class="button-list">
			<button @click="clickHomeButton">
				<font-awesome-icon icon="home"></font-awesome-icon>Return home
			</button>
			<button v-if="!$store.getters['user/connected']" class="connect-button" v-on:click="clickConnectButton">
				<font-awesome-icon :icon="['fab', 'discord']"></font-awesome-icon>Connect now!
			</button>
		</div>
	</div>
</template>

<script>
	// Import dependencies
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faHome } from '@fortawesome/free-solid-svg-icons';
	import { faDiscord } from '@fortawesome/free-brands-svg-icons';

	// Font awesome
	library.add(faHome, faDiscord);

	export default {
		name: 'tomika-content-unauthorized',
		methods: {
			clickHomeButton() {
				this.$store.dispatch('nav/switchContent', { pathname: '/' });
			},
			clickConnectButton() {
				window.open(`${this.$store.state.app.backEnd}/user/connect`);
			}
		}
	}
</script>

<style scoped>
	#tomika-content-unauthorized {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 20px;
		color: hsl(0,0%,80%);
	}
	.button-list {
		margin-top: 12px;
	}
	button {
		color: inherit;
		padding: 1em;
		margin-left: 12px;
	}
	button:first-child {
		margin-left: 0;
	}
	.connect-button {
		background-color: #7289DA;
		font-weight: bold;
	}
</style>