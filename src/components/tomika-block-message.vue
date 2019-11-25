<template>
	<div class="tomika-block-message" :class="classObj">
		<div class="icon"><font-awesome-icon :icon="icon"></font-awesome-icon></div>
		<div class="text"><slot></slot></div>
	</div>
</template>

<script>
	// Import dependencies
	import Vue from 'vue';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faInfoCircle, faExclamationTriangle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

	// Font awesome
	library.add(faInfoCircle, faExclamationTriangle, faExclamationCircle);
	Vue.component('font-awesome-icon', FontAwesomeIcon);

	// The different types
	const types = {
		'info': 'info-circle',
		'warning': 'exclamation-triangle',
		'error': 'exclamation-circle'
	};

	export default {
		name: "tomika-block-message",
		props: {
			type: {
				type: String,
				default: 'info',
				validator(t) { return Object.keys(types).indexOf(t) !== -1; }
			},
			small: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			icon() {
				return types[this.type];
			},
			classObj() {
				let obj = { smallText: this.small }
				obj[this.type] = true;
				return obj;
			}
		}
	}
</script>

<style scoped>
	.tomika-block-message {
		display: flex;
		flex-direction: row;
		margin: 8px;
		padding: 8px;
		border-radius: 8px;
		color: hsl(240,25%,75%);
		border: 1px dashed hsl(240,25%,75%);
		background-color: hsl(240,20%,20%);
	}
	.icon {
		margin-right: 8px;
	}
	.text {
		flex-grow: 1;
	}
	.smallText .text {
		font-size: 0.7em;
	}
	.warning {
		color: hsl(40,25%,75%);
		border: 1px dashed hsl(40,25%,75%);
		background-color: hsl(40,20%,20%);
	}
	.error {
		color: hsl(0,25%,75%);
		border: 1px dashed hsl(0,25%,75%);
		background-color: hsl(0,20%,20%);
	}
</style>