<template>
	<div id="tomika-content-db">
		<div class="doc-type-tab-list">
			<div v-for="docType in docTypes" :key="docType.componentName" :class="{ selected: docType.componentName ===
			selectedDocType }" @click="selectedDocType = docType.componentName">{{ docType.title }}</div>
		</div>
		<component :is="selectedDocType"></component>
	</div>
</template>

<script>
	// Import components
	import tomikaDbSplatoonMainWeapons from './tomika-db-splatoon-main-weapons';
	import tomikaDbSplatoonSubWeapons from './tomika-db-splatoon-sub-weapons';
	import tomikaDbSplatoonSpecialWeapons from './tomika-db-splatoon-special-weapons';

	export default {
		name: "tomika-content-db",
		components: {
			tomikaDbSplatoonMainWeapons,
			tomikaDbSplatoonSubWeapons,
			tomikaDbSplatoonSpecialWeapons
		},
		data() {
			return {
				selectedDocType: 'tomika-db-splatoon-main-weapons',
				docTypes: [
					{ componentName: 'tomika-db-splatoon-main-weapons', title: 'Mains' },
					{ componentName: 'tomika-db-splatoon-sub-weapons', title: 'Subs' },
					{ componentName: 'tomika-db-splatoon-special-weapons', title: 'Specials' }
				]
			}
		}
	}
</script>

<style scoped>
.doc-type-tab-list {
	display: flex;
	flex-direction: row;
}
.doc-type-tab-list > div {
	font-weight: bold;
	padding: 12px;
	cursor: pointer;
	opacity: 0.7;
	transition: opacity 100ms;
}
.doc-type-tab-list > div:hover, .doc-type-tab-list > div.selected {
	opacity: 1;
}
</style>