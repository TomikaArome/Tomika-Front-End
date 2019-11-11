<template>
	<div id="app">
		<tomika-nav></tomika-nav>
	</div>
</template>

<script>
import tomikaNav from "./tomika-nav";

export default {
	name: 'tomika-app',
	components: {
		tomikaNav
	}
}
</script>

<style scoped>
#app {
	font-family: Splatoon2, Arial, sans-serif;
}
</style>
