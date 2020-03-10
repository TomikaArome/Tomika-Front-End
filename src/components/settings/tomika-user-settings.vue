<template>
	<div class="tomika-user-settings">
		<h1>Discord account</h1>
		<div class="user-info">
			<tomika-discord-pfp :size="60"></tomika-discord-pfp>
			<div class="user-main-info">
				<div class="user-name">
					<span class="display-name">{{ $store.state.discord.user.username }}</span>
					<span class="discriminator">#{{ $store.state.discord.user.discriminator }}</span>
				</div>
				<div class="user-status">
					<svg viewBox="-1 -1 2 2" :fill="disconnectingStatus ? 'rgb(116, 127, 141)' : 'rgb(67, 181, 129)'">
						<circle r="1"></circle>
					</svg>
					<div>{{ disconnectingStatus ? 'Disconnecting...' : 'Connected' }}
						<span class="discriminator" v-if="!disconnectingStatus">{{ connectDate }}</span>
					</div>
				</div>
			</div>
			<div class="user-status-controls">
				<button class="red" @click="disconnect()" :disabled="disconnectingStatus">
					<font-awesome-icon :icon="disconnectingStatus ? 'spinner' : 'lock'"
						:spin="disconnectingStatus"></font-awesome-icon>
				</button>
			</div>
		</div>
	</div>
</template>

<script>
	// Import dependencies
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';

	// Import components
	import tomikaDiscordPfp from '../wrappers/tomika-discord-pfp';
	import tomikaPopup from '../tomika-popup';

	// Import requests
	import { disconnectReq } from '../../requests/user';

	// Font awesome
	library.add(faLock, faSpinner);

	export default {
		name: "tomika-user-settings",
		components: {
			tomikaDiscordPfp
		},
		computed: {
			disconnectingStatus() {
				return this.$store.state.request.progress['/discord/disconnect'];
			},
			connectDate() {
				let r = '';
				if (this.$store.state.discord.user.connectTime) {
					const d = new Date(this.$store.state.discord.user.connectTime);
					let suffix = 'th';
					const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
					switch (d.getDate()) {
						case 1: case 21: case 31: suffix = 'st'; break;
						case 2: case 22: suffix = 'nd'; break;
						case 3: case 23: suffix = 'rd'; break;
					}
					r = `since ${d.getDate()}${suffix} ${month[d.getMonth()]} ${d.getFullYear()}`;
				}
				return r;
			}
		},
		methods: {
			async disconnect() {
				this.$store.commit('app/pushPopup', { popupComponent: {
					template: '<tomika-popup prompt="Are you sure you want to disconnect?" :choices="choices"></tomika-popup>',
					components: { tomikaPopup },
					data() { return { choices: [
						{ buttonText: 'No', buttonAction: (close) => { close(); } },
							{ buttonText: 'Yes', buttonAction: (close) => { disconnectReq(); close(); } }
					] } }
				} });
			}
		}
	}
</script>

<style scoped>
	.tomika-user-settings {
		padding: 10px 20px;
	}
	h1 {
		margin: 0 0 8px 0;
		font-size: 20px;
		padding: 0 8px;
		border-bottom: 1px solid hsl(0,0%,30%);
	}
	.user-info {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 0 20px;
		margin-bottom: 8px;
	}
	.user-main-info {
		flex-grow: 1;
		margin-left: 12px;
	}
	.user-name {
		margin-bottom: 0.1em;
	}
	.display-name {
		font-size: 1.5em;
	}
	.discriminator {
		color: hsl(0,0%,50%);
	}
	.user-name > .discriminator {
		margin-left: 0.2em;
	}
	.user-status {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.user-status > svg {
		width: 8px;
		margin-right: 6px;
	}
	.user-status-controls button {
		font-size: 16px;
		width: 40px;
		height: 40px;
		padding: 0;
	}
</style>