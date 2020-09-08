<template>
	<div class="discord-pfp" :style="{ width: size + 'px', height: size + 'px' }">
		<img :src="url" />
		<img :src="animatedUrl" class="animatedDiscordPfp" v-if="animated" />
	</div>
</template>

<script>
	export default {
		name: "tomika-discord-pfp",
		props: {
			size: {
				validator(val) { return /^[0-9]+/.test(val); },
				default: 32
			},
			discordId: {
				type: String,
				default: ''
			},
			avatar: {
				type: String,
				default: '0'
			}
		},
		computed: {
			animated() {
				return this.avatar === null ? false : (/^a_/.test(this.avatar));
			},
			url() {
				if (this.discordId === '') {
					return `https://cdn.discordapp.com/embed/avatars/${this.avatar}.png`;
				} else {
					return `https://cdn.discordapp.com/avatars/${this.discordId}/${this.avatar}.png`;
				}
			},
			animatedUrl() {
				if (this.animated) {
					return this.url.replace(/png$/, 'gif');
				}
				return this.url;
			}
		}
	}
</script>

<style scoped>
	.discord-pfp {
		border-radius: 100%;
		overflow: hidden;
		position: relative;
	}
	img {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
	}
	.animatedDiscordPfp {
		opacity: 0;
	}
	.discord-pfp:hover .animatedDiscordPfp {
		opacity: 1;
	}
</style>