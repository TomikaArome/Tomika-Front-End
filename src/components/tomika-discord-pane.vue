<template>
	<div id="tomika-discord-pane" class="tomika-pane">
		<svg class="chevron" viewBox="0 0 1 1"><path d="M2 1l-1-1l-1 1z"></path></svg>
		<template v-if="$store.state.app.backEndUnreachable">
			<div class="title">Tomika.ink's server could not be reached</div>
			<p>The server is required for Discord authentication and other resources connected to the site.</p>
			<p>Try refreshing the page later, or contact <a target="_blank" href="http://twitter.com/TomikaArome">@TomikaArome</a> on Twitter or Tomika#4051 on Discord.</p>
			<p style="font-weight: bold; color: hsl(0,25%,50%);">Please note that access to the server may be temperamental, as the site is still in development and there is not yet a huge need for the server to be working 24/7.</p>
		</template>
		<template v-else-if="$store.getters['discord/connected']">
			<tomika-discord-pfp size="64" />
			<div class="displayName">{{ $store.state.discord.user.username }}</div>
			<div class="tag">#{{ $store.state.discord.user.discriminator }}</div>
			<button class="connect-button red notFilled" v-on:click="disconnect">
				<font-awesome-icon icon="lock"></font-awesome-icon>Disconnect
			</button>
		</template>
		<template v-else>
			<div v-if="iframeVisible" class="iframe-wrapper">
				<iframe ref="authIframe" :src="`${$store.state.app.backEnd}/discordoauth`"></iframe>
			</div>
			<template v-else>
				<div class="title">Connect your Discord account to tomika.ink!</div>
				<div class="checklist">
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
				</div>
				<button class="connect-button" v-on:click="iframeVisible = true">
					<font-awesome-icon :icon="['fab', 'discord']"></font-awesome-icon>Connect now!
				</button>
			</template>
		</template>
	</div>
</template>

<script>
	// Import dependencies
	import Vue from 'vue';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faCheck, faLock } from '@fortawesome/free-solid-svg-icons';
	import { faDiscord } from '@fortawesome/free-brands-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

	// Import components
	import tomikaDiscordPfp from './tomika-discord-pfp';

	// Font awesome
	library.add(faCheck, faLock, faDiscord);
	Vue.component('font-awesome-icon', FontAwesomeIcon);

	export default {
		name: "tomika-discord-pane",
		components: {
			tomikaDiscordPfp
		},
		data() {
			return {
				iframeVisible: false
			}
		},
		mounted() {
			this.$parent.positionPane('tomika-nav-bar-discord-button', 'tomika-discord-pane');

			setInterval(() => {
				if (this.$refs.authIframe) {
					this.$refs.authIframe.contentWindow.postMessage('ping', '*');
				}
			}, 100);

			window.addEventListener('message', async (event) => {
				if (event.data && event.data.authSucceeded) {
					try {
						const userInfoResponse = await fetch(`${this.$store.state.app.backEnd}/discord/user`, {
							method: 'GET',
							credentials: 'include'
						});
						if (userInfoResponse.ok) {
							this.$store.commit('discord/setUser', await userInfoResponse.json());
							this.iframeVisible = false;
						}
					} catch (err) {
						console.log(err);
					}
				}
			});
		},
		methods: {
			async disconnect() {
				let disconnectResponse = await fetch(`${this.$store.state.app.backEnd}/discord/disconnect`, {
					method: 'POST',
					credentials: 'include'
				});
				if (disconnectResponse.ok && disconnectResponse.status === 200) {
					this.$store.commit('discord/setUser');
				}
			}
		}
	}
</script>

<style scoped>
	#tomika-discord-pane {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 300px;
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
		padding: 0px 8px;
		text-align: right;
		color: hsl(120,30%,50%);
		transform: translateY(5%);
	}
	.checklist > div > div:nth-child(2) {
		flex-grow: 1;
		text-align: left;
		color: hsl(0,0%,70%);
	}
	.connect-button {
		margin-top: 12px;
	}
	.connect-button:not(.notFilled) {
		background-color: #7289DA;
	}
	.connect-button > svg {
		margin-right: 6px;
	}
	.iframe-wrapper {
		width: 320px;
		height: 376px;
		overflow: hidden;
		border-radius: 8px;
	}
	iframe {
		border: none;
		transform: scale(0.8);
		transform-origin: top left;
		width: 400px;
		height: 470px;
	}
	.displayName {
		margin-top: 8px;
	}
	.tag {
		font-size: 0.7em;
		color: hsl(0,0%,50%);
	}
</style>