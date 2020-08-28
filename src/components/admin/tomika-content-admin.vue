<template>
	<div id="tomika-content-admin">
		<div class="category-list">
			<h1>Administrator tools</h1>
			<div v-for="cat in categories" :key="cat.componentName" :class="{ selected: selectedCategory ===
			cat.componentName }" @click="selectedCategory = cat.componentName">{{ cat.categoryTitle }}</div>
		</div>
		<component :is="selectedCategory"></component>
	</div>
</template>

<script>
	// Import components
	import tomikaAdminUsers from './tomika-admin-users';
	import tomikaAdminGroups from './tomika-admin-groups';
	import tomikaAdminPermissions from './tomika-admin-permissions';

	export default {
		name: "tomika-content-admin",
		components: {
			tomikaAdminUsers,
			tomikaAdminGroups,
			tomikaAdminPermissions
		},
		data() {
			return {
				selectedCategory: 'tomika-admin-permissions',
				categories: [
					{ categoryTitle: 'Users', componentName: 'tomika-admin-users' },
					{ categoryTitle: 'Groups', componentName: 'tomika-admin-groups' },
					{ categoryTitle: 'Permissions', componentName: 'tomika-admin-permissions' }
				]
			}
		},
		mounted() {

		}
	}
</script>

<style scoped>
#tomika-content-admin {
	display: flex;
	flex-direction: row;
	height: calc(100% - 40px);
	width: 100%;
}
.category-list {
	height: 100%;
	min-width: 250px;
	width: 250px;
	background-color: hsla(0,0%,5%,1);
	border-right: 1px solid hsl(180,25%,30%);
}
.category-list > h1 {
	margin: 0;
	padding: 16px 0;
	text-align: center;
	font-size: 20px;
	font-family: "Roboto Condensed", Arial, sans-serif;
}
.category-list > div {
	padding: 10px 20px;
	font-size: 1.2em;
	cursor: pointer;
	transition: background-color 100ms;
}
.category-list > div:hover {
	background-color: hsla(0,0%,100%,0.05);
}
.category-list > div.selected {
	background-color: hsla(0,0%,100%,0.1);
}
.category-list + * {
	flex-grow: 1;
	height: 100%;
	width: calc(100% - 1000px);
}
</style>