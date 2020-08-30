<template>
	<div id="tomika-content-admin">
		<div class="category-list" :class="{ collapsed: collapsed }">
			<h1 v-if="!collapsed">Administrator tools</h1>
			<div class="category-scroll-list">
				<div v-for="(cat, key) in categories" :key="key">
					<div v-if="!collapsed" class="category-title">{{ cat.categoryTitle }}</div>
					<hr v-else-if="key !== 0">
					<div v-for="subCat in cat.subCategories" :key="subCat.componentName" class="sub-category-button" :class="{ selected:
					selectedCategory === subCat.componentName }" @click="switchCategory(subCat)">
						<div class="icon"><font-awesome-icon :icon="subCat.icon"></font-awesome-icon></div>
						<div class="sub-category-title">{{ subCat.categoryTitle }}</div>
					</div>
				</div>
			</div>
			<th class="collapse-button sub-category-button" @click="collapsed = !collapsed">
				<div class="icon"><font-awesome-icon :icon="collapsed ? 'chevron-right' : 'chevron-left'"></font-awesome-icon></div>
				<div class="sub-category-title">Collapse</div>
			</th>
		</div>
		<component :is="selectedCategory"></component>
	</div>
</template>

<script>
	// Import components
	import tomikaAdminUsers from './tomika-admin-users';
	import tomikaAdminGroups from './tomika-admin-groups';
	import tomikaAdminPermissions from './tomika-admin-permissions';

	// Font awesome
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faChevronRight, faChevronLeft, faUser, faUsers, faGavel } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
	library.add(faChevronRight, faChevronLeft, faUser, faUsers, faGavel);

	export default {
		name: "tomika-content-admin",
		components: {
			tomikaAdminUsers,
			tomikaAdminGroups,
			tomikaAdminPermissions,
			FontAwesomeIcon
		},
		data() {
			return {
				selectedCategory: 'tomika-admin-permissions',
				collapsed: false,
				categories: [
					{ categoryTitle: 'General', subCategories: [
						{ categoryTitle: 'Users', componentName: 'tomika-admin-users', icon: 'user', pathname: 'users', permission: 'perm.admin.users' },
						{ categoryTitle: 'Groups', componentName: 'tomika-admin-groups', icon: 'users', pathname: 'groups', permission: 'perm.admin.groups' },
						{ categoryTitle: 'Permissions', componentName: 'tomika-admin-permissions', icon: 'gavel', pathname: 'permissions', permission: 'perm.admin.permissions' }
					] }
				]
			}
		},
		methods: {
			switchCategory(catObj) {
				this.selectedCategory = catObj.componentName;
				window.history.pushState(null, null, '/admin/' + catObj.pathname);
			}
		},
		mounted() {
			let shortenedPathname = window.location.pathname.replace(/^\/admin\/?/, '');
			if (shortenedPathname) {
				let catObj = null;
				for (let cat of this.categories) {
					for (let subCat of cat.subCategories) {
						if (shortenedPathname === subCat.pathname) { catObj = subCat; }
					}
				}
				if (catObj) { this.switchCategory(catObj); }
				else { window.history.replaceState(null, null, '/admin'); }
			}
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
	display: flex;
	flex-direction: column;
	height: 100%;
	background-color: hsla(0,0%,5%,1);
	border-right: 1px solid hsl(180,25%,30%);
	user-select: none;
	overflow-x: hidden;
}
.category-list > * {
	width: 250px;
}
.category-list.collapsed {
	width: 50px;
}
.category-list hr {
	width: 32px;
	border-bottom: 1px solid hsla(0,0%,100%,0.2);
	margin: 8px;
}
.category-scroll-list {
	flex-grow: 1;
	flex-shrink: 1;
	overflow-y: scroll;
}
.category-list > h1 {
	margin: 0;
	padding: 16px 0 10px 0;
	text-align: center;
	font-size: 20px;
	font-family: "Roboto Condensed", Arial, sans-serif;
}
.category-title {
	padding: 10px 14px 4px 14px;
	font-style: italic;
}
.sub-category-button {
	display: flex;
	flex-direction: row;
	font-size: 1.2em;
	cursor: pointer;
	transition: background-color 100ms;
}
.sub-category-button:hover {
	background-color: hsla(0,0%,100%,0.05);
}
.sub-category-button.selected {
	background-color: hsla(0,0%,100%,0.1);
}
.icon {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 50px;
}
.sub-category-title {
	padding: 10px 0;
	flex-grow: 1;
}
.collapse-button {
	font-size: 1.2em;
	display: flex;
	flex-direction: row;
	font-weight: normal;
	text-align: left;
	position: sticky;
	bottom: 0;
	padding: 4px 0;
}
.category-list + * {
	flex-grow: 1;
	height: 100%;
	width: calc(100% - 1000px);
}
</style>