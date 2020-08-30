<template>
	<tomika-editable-table v-bind="$attrs" v-on="$listeners" id-prop-name="_id" :data="data" :on-change="onChange"
		:on-delete="onDelete"></tomika-editable-table>
</template>

<script>
	/**
	 * Wrapper for the tomika-editable-table component which has extra interactivity with the backend
	 * The idea is this wrapper loads the data itself given a URL and implements the onChange and onDelete functions
	 * Some props however still work the same way and need to be implemented
	 */

	// Import dependencies
	import f from '../../requests/fetch';

	// Import components
	import tomikaEditableTable from '../tomika-editable-table';

	export default {
		name: "tomika-collection-table",
		inheritAttrs: false,
		components: {
			tomikaEditableTable
		},
		props: {
			dataUri: { type: String, required: true },
			addUri: { type: String },
			updateUri: { type: String, required: true },
			deleteUri: { type: String }
		},
		data() {
			return {
				data: []
			}
		},
		methods: {
			async fetchData() {
				let r = await f(this.dataUri);
				if (r.success && r.o.ok) {
					this.data = r.o.result.documents;
				}
			},
			async onChange(newObj, oldObj) {
				if (oldObj === null && !this.addUri) { return false; }
				let r = false, res = null;
				// Check if addition of change
				if (oldObj === null) {
					// Addition
					res = await f(this.addUri, { method: 'POST', body: newObj });
				} else {
					// Update
					res = await f(this.updateUri, { method: 'POST', body: newObj });
				}
				if (res.success) {
					if (res.o.ok) {
						r = res.o.result;
					} else {
						r = `${res.o.error.code}: ${res.o.error.message}`;
					}
				}
				return r;
			},
			async onDelete(obj) {
				if (!this.deleteUri) { return false; }
				let r = false;
				let res = await f(this.deleteUri, { method: 'POST', body: { _id: obj._id } });
				if (res.success) {
					if (res.o.ok) {
						r = true;
					} else {
						r = `${res.o.error.code}: ${res.o.error.message}`;
					}
				}
				return r;
			}
		},
		async mounted() {
			// Automatically add the _id column (but leave it hidden in the table to avoid clutter)
			this.$attrs.columns.unshift({
				propName: '_id',
				colTitle: 'ID',
				style: { fontFamily: '"Courier New", monospace', color: 'hsl(0,0%,75%)' },
				editable: false,
				hiddenInTable: true
			});
			await this.fetchData();
		}
	}
</script>

<style scoped>

</style>