<template>
	<a target="_blank" :href="`https://twitter.com/${$props.handle}`">
		{{ $slots.default ? '' : `@${$props.handle}` }}
		<slot></slot>
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