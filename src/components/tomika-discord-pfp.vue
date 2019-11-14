<template>
	<div :style="{ width: this.pfpSize + 'px', height: this.pfpSize + 'px' }">
		<img :src="pfpUrl">
		<img class="animatedDiscordPfp" :src="pfpUrlAnimated" v-if="avatarAnimated">
	</div>
</template>

<script>
	export default {
		name: "tomika-discord-pfp",
		props: ['size'],
		computed: {
			pfpSize() {
				return /^[0-9]+$/.test(this.$props.size) ? this.$props.size : 32;
			},
			userId() {
				return this.$store.getters['discord/connected'] ? this.$store.state.discord.user.id : null;
			},
			avatar() {
				return this.$store.getters['discord/connected'] ? this.$store.state.discord.user.avatar : null;
			},
			avatarAnimated() {
				return this.avatar === null ? false : (/^a_/.test(this.avatar));
			},
			pfpUrl() {
				if (this.$store.getters['discord/connected']) {
					return `https://cdn.discordapp.com/avatars/${this.userId}/${this.avatar}.png`;
				}
				return require('../assets/images/discordDefaultPfp.png');
			},
			pfpUrlAnimated() {
				if (this.$store.getters['discord/connected']) {
					const ext = this.avatarAnimated ? 'gif' : 'png';
					return `https://cdn.discordapp.com/avatars/${this.userId}/${this.avatar}.${ext}`;
				}
				return require('../assets/images/discordDefaultPfp.png');
			}
		}
	}
</script>

<style scoped>
	div {
		border-radius: 100%;
		overflow: hidden;
		position: relative;
	}
	img {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0px;
		left: 0px;
	}
	.animatedDiscordPfpOnHover .animatedDiscordPfp {
		opacity: 0;
	}
	.animatedDiscordPfpOnHover:hover .animatedDiscordPfp {
		opacity: 1;
	}
</style>