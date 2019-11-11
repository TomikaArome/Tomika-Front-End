<template>
	<div id="tomika-nav-bar">
		test
	</div>
</template>

<script>
	import Vue from 'vue';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faBars } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

	library.add(faBars);
	Vue.component('font-awesome-icon', FontAwesomeIcon);

	export default {
		name: "tomika-nav"
	};
</script>

<style scoped>
	#tomika-nav-bar {
		color: #ffffff;
		font-family: Splatoon2, Arial, sans-serif;
		background: hsla(0,0%,5%,1)
	}
</style>