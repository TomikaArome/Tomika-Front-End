<template>
	<div id="tomika-discord-pane" class="tomika-pane">
		<svg class="chevron" viewBox="0 0 3 3"><path d="M6 3l-3-3l-3 3"></path></svg>
		<template v-if="$store.state.request.progress['/user/@me']">
			<div class="title" style="margin:0">Connecting...</div>
		</template>
		<template v-else-if="$store.state.app.backEndUnreachable">
			<div class="title">Tomika.ink's server could not be reached</div>
			<p>The server is required for Discord authentication and other resources connected to the site.</p>
			<p>Try refreshing the page later, or contact <a target="_blank" href="http://twitter.com/TomikaArome">@TomikaArome</a> on Twitter or Tomika#4051 on Discord.</p>
			<p style="font-weight: bold; color: hsl(0,25%,50%);">Please note that access to the server may be temperamental, as the site is still in development and there is not yet a huge need for the server to be working 24/7.</p>
		</template>
		<template v-else-if="$store.getters['user/connected']">
			<tomika-discord-pfp size="64" :discord-id="$store.getters['user/discordId']" :avatar="$store.getters['user/avatar']" />
			<div class="displayName">{{ $store.getters['user/name'] }}</div>
			<div class="tag">#{{ $store.getters['user/discriminator'] }}</div>
			<div class="button-list">
				<button v-if="$store.getters['user/hasPermission']('perm.user.settings.view')" @click="clickSettingsButton">
					<font-awesome-icon icon="cogs"></font-awesome-icon>Settings
				</button>
				<button class="notFilled" @click="clickDisconnectButton">
					<font-awesome-icon icon="lock"></font-awesome-icon>Disconnect
				</button>
			</div>
		</template>
		<template v-else>
			<template>
				<div class="title">Connect your Discord account to tomika.ink!</div>
				<div class="checklist">
					<div>
						<div class="info-blue"><font-awesome-icon icon="info-circle"></font-awesome-icon></div>
						<div>Disclaimer: Connecting your Discord account is already possible but not yet necessary. Please do not yet bother unless I have specifically asked you to and you know what you're connecting for.</div>
					</div>
				</div>
				<!--<div class="checklist">
					<div>
						<div><font-awesome-icon icon="check"></font-awesome-icon></div>
						<div>Get a more personalised experience by setting app preferences</div>
					</div>
					<div>
						<div><font-awesome-icon icon="check"></font-awesome-icon></div>
						<div>Interact with the tomika.ink bot</div>
					</div>
					<div>
						<div><font-awesome-icon icon="check"></font-awesome-icon></div>
						<div>Your account data is not collected</div>
					</div>
				</div>-->
				<div class="button-list">
					<button class="connect-button" v-on:click="clickConnectButton">
						<font-awesome-icon :icon="['fab', 'discord']"></font-awesome-icon>Connect now!
					</button>
				</div>
			</template>
		</template>
	</div>
</template>

<script>
	// Import dependencies
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faCheck, faLock, faInfoCircle, faCogs } from '@fortawesome/free-solid-svg-icons';
	import { faDiscord } from '@fortawesome/free-brands-svg-icons';
	import { userDisconnectReq } from '../../requests/user';

	// Import components
	import tomikaDiscordPfp from '../wrappers/tomika-discord-pfp';

	// Font awesome
	library.add(faCheck, faLock, faDiscord, faInfoCircle, faCogs);

	export default {
		name: "tomika-discord-pane",
		components: {
			tomikaDiscordPfp
		},
		mounted() {
			this.$parent.positionPane('tomika-nav-bar-discord-button', 'tomika-discord-pane');
		},
		methods: {
			clickConnectButton() {
				window.open(`${this.$store.state.app.backEnd}/user/connect`);
			},
			clickDisconnectButton() {
				userDisconnectReq();
				this.$store.commit('nav/setDiscordPaneOpen', false);
			},
			clickSettingsButton() {
				this.$store.dispatch('nav/switchContent', { pathname: '/user' });
				this.$store.commit('nav/setDiscordPaneOpen', false);
			}
		}
	}
</script>

<style scoped>
	#tomika-discord-pane {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 400px;
	}
	.title {
		font-weight: bold;
		margin-bottom: 8px;
	}
	p {
		color: hsl(0,0%,70%);
		font-size: 0.85em;
		margin: 0.5em 0;
	}
	p:last-child {
		margin-bottom: 0;
	}
	.button-list {
		display: flex;
		flex-direction: column;
	}
	.button-list > * {
		align-self: stretch;
	}
	.checklist {
		display: flex;
		flex-direction: column;
		font-size: 0.85em;
	}
	.checklist > div {
		display: flex;
		flex-direction: row;
		padding: 2px 0px;
	}
	.checklist > div > div:nth-child(1) {
		padding: 0 8px;
		text-align: right;
		color: hsl(120,30%,50%);
		transform: translateY(5%);
	}
	.checklist > div > div.info-blue:nth-child(1) {
		color: hsl(220,30%,60%);
	}
	.checklist > div > div:nth-child(2) {
		flex-grow: 1;
		text-align: left;
		color: hsl(0,0%,70%);
	}
	button {
		margin-top: 4px;
	}
	button:first-of-type {
		margin-top: 12px;
	}
	.connect-button:not(.notFilled) {
		background-color: #7289DA;
	}
	button > svg {
		margin-right: 6px;
	}
	.displayName {
		margin-top: 8px;
	}
	.tag {
		font-size: 0.7em;
		color: hsl(0,0%,50%);
	}
</style>