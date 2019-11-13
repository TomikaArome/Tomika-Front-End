<template>
	<div id="tomika-discord-pane" class="tomika-pane">
		<svg class="chevron" viewBox="0 0 1 1"><path d="M2 1l-1-1l-1 1z"></path></svg>
		<template v-if="$store.state.discord.connected">
			<tomika-discord-pfp size="64" />
			<div class="displayName">Tomika</div>
			<div class="tag">Tomika#4051</div>
		</template>
		<template v-else>
			disconnected
		</template>
	</div>
</template>

<script>
	// Import components
	import tomikaDiscordPfp from './tomika-discord-pfp';

	export default {
		name: "tomika-discord-pane",
		components: {
			tomikaDiscordPfp
		},
		mounted() {
			this.$parent.positionPane('tomika-nav-bar-discord-button', 'tomika-discord-pane');
		}
	}
</script>

<style scoped>
	.tag {
		font-size: 0.7em;
		color: hsl(0,0%,50%);
	}
</style>