<template>
	<div class="tomika-admin-settings">
		<h1>Discord bot</h1>
		<div class="bot-info">
			<img :src="$store.state.discord.bot.avatarUrl" alt="">
			<div class="bot-main-info">
				<div class="bot-name">
					<span class="display-name">{{ $store.state.discord.bot.username }}</span>
					<span class="discriminator">#{{ $store.state.discord.bot.discriminator }}</span>
				</div>
				<div class="bot-status">
					<svg viewBox="-1 -1 2 2" :fill="botStatus.colour"><circle r="1"></circle></svg>
					{{ botStatus.text }}
					<span v-if="$store.state.discord.bot.connected && !botInfoRequest && !botStatusRequest" class="discriminator">{{ uptime }}</span>
				</div>
			</div>
			<div class="bot-status-controls">
				<button :disabled="toggleBotStatusDisabled" @click="toggleBotStatus()">
					<font-awesome-icon :icon="botStatusRequest ? 'spinner' : 'power-off'" :spin="botStatusRequest"></font-awesome-icon>
				</button>
			</div>
		</div>
		<tomika-block-message v-if="$store.state.discord.user.shouldUseGuildsScope" type="warning" small>You're connected to Discord without having authorised the guilds scope. This is normal for regular users, but relies on the Discord bot being connected to authorise you as admin. <a target="_blank" :href="`${$store.state.app.backEnd}/discord/connect?guilds=1`">Connect to discord using the guilds scope</a> and refresh the page to solve this and have access to toggling the bot's status.</tomika-block-message>
	</div>
</template>

<script>
	// Import dependencies
	import Vue from 'vue';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faPowerOff, faSpinner } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

	// Import components
	import tomikaBlockMessage from '../tomika-block-message';
	import tomikaPopup from '../tomika-popup';

	// Import requests
	import { infoReq, startReq, stopReq } from '../../requests/discordbot';

	// Font awesome
	library.add(faPowerOff, faSpinner);
	Vue.component('font-awesome-icon', FontAwesomeIcon);

	export default {
		name: "tomika-admin-settings",
		components: {
			tomikaBlockMessage
		},
		computed: {
			toggleBotStatusDisabled() {
				return this.botStatusRequest || (this.$store.state.discord.user && this.$store.state.discord.user.shouldUseGuildsScope);
			},
			botStatus() {
				let r = {};
				if (this.$store.state.discord.bot.connected) {
					r.text = this.botStatusRequest ? 'Disconnecting...' : 'Connected';
				} else {
					r.text = this.botStatusRequest ? 'Connecting...' : 'Disconnected'
				}
				r.colour = this.$store.state.discord.bot.connected && !this.botInfoRequest && !this.botStatusRequest
					? 'rgb(67, 181, 129)' : 'rgb(116, 127, 141)';
				if (this.botInfoRequest) { r.text = 'Fetching bot info'; }
				return r;
			},
			uptime() {
				let r = 'Uptime:';
				const ms = this.$store.state.discord.bot.uptime;
				const rd = ms % 86400000, d = (ms - rd) / 86400000;
				const rh = rd % 3600000, h = (rd - rh) / 3600000;
				const rm = rh % 60000, m = (rh - rm) / 60000;
				const s = Math.floor(rm / 1000);
				r += (d ? ` ${d}d` : '');
				r += (h ? ` ${h}h` : '');
				r += (m ? ` ${m}min` : '');
				r += (s ? ` ${s}s` : '');
				if (r === 'Uptime:') { r += ' 0s'; }
				return r;
			},
			botInfoRequest() {
				return this.$store.state.request.progress['/discord/bot/user'];
			},
			botStatusRequest() {
				if (this.$store.state.discord.bot.connected) {
					return this.$store.state.request.progress['/discord/bot/stop'];
				} else {
					return this.$store.state.request.progress['/discord/bot/start'];
				}
			}
		},
		methods: {
			async toggleBotStatus(confirmOk) {
				if (!confirmOk && this.$store.state.discord.bot.connected) {
					this.$store.commit('app/pushPopup', {
						popupComponent: {
							template: `<tomika-popup prompt="Are you sure you want to disconnect the bot?" :choices="choices"></tomika-popup>`,
							components: { tomikaPopup },
							data: () => { return { choices: [
								{ buttonText: 'No', buttonAction: (close) => { close(); } },
								{ buttonText: 'Yes', buttonAction: (close) => { this.toggleBotStatus(true); close(); } }
							] } }
						}
					});
					return;
				}
				if (this.$store.state.discord.bot.connected) {
					await stopReq();
				} else {
					await startReq();
				}
			},
			async getBotInfo() {
				await infoReq();
			}
		}
	}
</script>

<style scoped>
	.tomika-admin-settings {
		padding: 10px 20px;
	}
	h1 {
		margin: 0 0 8px 0;
		font-size: 20px;
		padding: 0 8px;
		border-bottom: 1px solid hsl(0,0%,30%);
	}
	.bot-info {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 0 20px;
		margin-bottom: 8px;
	}
	.bot-info + .tomika-block-message {
		margin-top: 16px;
	}
	.bot-info > img {
		width: 60px;
		border-radius: 100%;
	}
	.bot-main-info {
		flex-grow: 1;
		margin-left: 12px;
	}
	.bot-name {
		margin-bottom: 0.1em;
	}
	.display-name {
		font-size: 1.5em;
	}
	.discriminator {
		color: hsl(0,0%,50%);
		margin-left: 0.2em;
	}
	.bot-status {
		display: flex;
		flex-direction: row;
		align-items: center;
	}
	.bot-status > svg {
		width: 8px;
		margin-right: 6px;
	}
	.bot-status-controls button {
		font-size: 16px;
		width: 40px;
		height: 40px;
		padding: 0;
	}
</style>