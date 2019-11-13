<template>
	<img :src="pfpUrl" :style="{ width: this.pfpSize + 'px', height: this.pfpSize + 'px' }">
</template>

<script>
	export default {
		name: "tomika-discord-pfp",
		props: ['size'],
		data() {
			return {
				pfpUrl: require('../assets/images/discordDefaultPfp.png')
			}
		},
		computed: {
			pfpSize() {
				return /^[0-9]+$/.test(this.$props.size) ? this.$props.size : 32;
			}
		}
	}
</script>

<style scoped>
	img {
		border-radius: 100%;
	}
</style>