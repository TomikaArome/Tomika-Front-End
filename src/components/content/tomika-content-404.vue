<template>
	<div id="tomika-content-404">
		<div>The content you were looking for does not exist</div>
		<div class="button-list">
			<button @click="clickHomeButton">
				<font-awesome-icon icon="home"></font-awesome-icon>Return home
			</button>
		</div>
	</div>
</template>

<script>
	// Import dependencies
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faHome } from '@fortawesome/free-solid-svg-icons';

	// Font awesome
	library.add(faHome);

	export default {
		name: 'tomika-content-404',
		methods: {
			clickHomeButton() {
				this.$store.dispatch('nav/switchContent', { pathname: '/' });
			}
		}
	}
</script>

<style scoped>
#tomika-content-404 {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 20px;
	color: hsl(0,0%,80%);
}
.button-list {
	margin-top: 12px;
}
button {
	color: inherit;
	padding: 1em;
}
</style>