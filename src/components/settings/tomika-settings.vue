<template>
	<tomika-popup title="Settings" :tabs="tabs" :close-button-action="() => {$store.commit('nav/setSettingsOpen', false);}"></tomika-popup>
</template>

<script>
	// Import components
	import tomikaPopup from '../tomika-popup';
	import tomikaUserSettings from './tomika-user-settings';
	import tomikaAdminSettings from './tomika-admin-settings';
	import tomikaGuildSettings from './tomika-guild-settings';

	// Import requests
	import { infoReq } from '../../requests/discordbot';

	export default {
		name: 'tomika-settings',
		components: {
			tomikaPopup
		},
		computed: {
			tabs() {
				// The user settings tab is always available
				let settingsTabs = [{
					image: this.$store.state.discord.user.avatarUrl,
					contentComponent: {
						template: '<tomika-user-settings></tomika-user-settings>',
						components: { tomikaUserSettings }
					}
				}];
				// Get bot details
				const botInfo = this.$store.state.discord.bot;
				if (this.$store.state.discord.user && botInfo) {
					// Check if admin
					if (this.$store.state.discord.user.admin) {
						settingsTabs.push({
							image: botInfo.avatarUrl,
							contentComponent: {
								template: '<tomika-admin-settings></tomika-admin-settings>',
								components: { tomikaAdminSettings }
							}
						});
						settingsTabs.push({spacer: true});
					}
					// Cycle through guilds and add a tab for each guild the user is a member of
					if (botInfo.guilds) {
						for (let i in botInfo.guilds.filter((guild) => {
							return guild.memberOf;
						})) {
							settingsTabs.push({
								image: botInfo.guilds[i].iconUrl,
								contentComponent: {
									template: '<tomika-guild-settings :guild="guild"></tomika-guild-settings>',
									components: { tomikaGuildSettings },
									data() {
										return {guild: botInfo.guilds[i]};
									}
								}
							});
						}
					}
				}
				return settingsTabs;
			}
		},
		async mounted() {
			// Get bot details
			await infoReq();
		}
	}
</script>

<style scoped>

</style>