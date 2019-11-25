<template>
	<div class="tomika-guild-settings">
		{{ guild.name }}
	</div>
</template>

<script>
	export default {
		name: "tomika-guild-settings",
		props: {
			guild: Object
		}
	}
</script>

<style scoped>
	.tomika-guild-settings {
		padding: 10px 20px;
	}
</style>