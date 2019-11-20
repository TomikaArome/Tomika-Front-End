<template>
	<a target="_blank" :href="`https://twitter.com/${$props.handle}`">
		<slot>@{{ handle }}</slot>
	</a>
</template>

<script>
	export default {
		name: "tw-link",
		props: {
			handle: {
				type: String,
				default: 'TomikaArome'
			}
		}
	}
</script>

<style scoped>

</style>