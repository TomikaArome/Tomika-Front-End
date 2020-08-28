<template>
	<tomika-admin-editable-table id-prop-name="permString" :data="tableData" :columns="tableColumns"></tomika-admin-editable-table>
</template>

<script>
	import tomikaAdminEditableTable from './tomika-admin-editable-table';

	export default {
		name: "tomika-admin-permissions",
		components: {
			tomikaAdminEditableTable
		},
		data() {
			return {
				tableData: [
					{ permString: 'perm', description: 'Root of all permissions', isSomething: true },
					{ permString: 'perm.content', description: 'Manage content on the site', isSomething: true },
					{ permString: 'perm.content.about', description: 'Manage content in the about page of the site', isSomething: false },
					{ permString: 'perm.content.about.art', description: 'Manage content in the art section of the about page of the site', isSomething: true },
					{ permString: 'perm.content.about.programming', description: 'Manage content in the programming section of the about page of the site', isSomething: false }
				],
				tableColumns: [
					{ propName: 'permString', colTitle: 'Permission', editable: true, style: { fontFamily: '"Courier New", monospace', maxWidth: '300px', wordWrap: 'break-word' } },
					{ propName: 'description', colTitle: 'Description', editable: true, textarea: true },
					{ propName: 'isSomething', colTitle: 'Something', editable: true, isBoolean: true }
				]
			}
		}
	}
</script>

<style scoped>

</style>