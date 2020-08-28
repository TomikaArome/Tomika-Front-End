<template>
	<tomika-editable-table v-bind="$attrs" v-on="$listeners"></tomika-editable-table>
</template>

<script>
	/**
	 * Wrapper for the tomika-editable-table component which has extra interactivity with the backend
	 * The idea is this wrapper loads the data itself given a URL and implements the onChange and onDelete functions
	 * Some props however still work the same way and need to be implemented
	 */

	// Import dependencies
	import tomikaEditableTable from '../tomika-editable-table';

	export default {
		name: "tomika-collection-table",
		inheritAttrs: false,
		components: {
			tomikaEditableTable
		}
	}
</script>

<style scoped>

</style>