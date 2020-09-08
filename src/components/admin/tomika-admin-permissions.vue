<template>
	<tomika-collection-table id-prop-name="permString" :columns="tableColumns" data-uri="/permission/list"
		add-uri="/permission/add" update-uri="/permission/update" delete-uri="/permission/delete"></tomika-collection-table>
</template>

<script>
	import tomikaCollectionTable from '../wrappers/tomika-collection-table';

	export default {
		name: "tomika-admin-permissions",
		components: {
			tomikaCollectionTable
		},
		data() {
			return {
				tableColumns: [
					{
						propName: 'permString',
						colTitle: 'Permission string',
						editable: true,
						style: { fontFamily: '"Courier New", monospace', maxWidth: '300px', wordWrap: 'break-word' },
						validator: ({ newValue }) => {
							if (!/^perm\./.test(newValue)) { return 'Every permission must start with "perm.".'; }
							else { return true; }
						}
					},
					{
						propName: 'description',
						colTitle: 'Description',
						editable: true,
						textarea: true
					}
				]
			}
		}
	}
</script>

<style scoped>

</style>