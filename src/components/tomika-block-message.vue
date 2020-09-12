<template>
	<div class="tomika-block-message" :class="classObj">
		<div class="icon"><font-awesome-icon :icon="icon"></font-awesome-icon></div>
		<div class="text"><slot></slot></div>
	</div>
</template>

<script>
	// Import dependencies
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faInfoCircle, faExclamationTriangle, faExclamationCircle, faCheck } from '@fortawesome/free-solid-svg-icons';

	// Font awesome
	library.add(faInfoCircle, faExclamationTriangle, faExclamationCircle, faCheck);

	// The different types
	const types = {
		'info': 'info-circle',
		'warning': 'exclamation-triangle',
		'error': 'exclamation-circle',
		'success': 'check'
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
		border: 1px dashed hsla(40,25%,75%,0.5);
		background-color: hsla(40,20%,20%,0.5);
	}
	.error {
		color: hsl(0,25%,75%);
		border: 1px dashed hsla(0,25%,75%,0.5);
		background-color: hsla(0,20%,20%,0.5);
	}
	.success {
		color: hsl(120,25%,75%);
		border: 1px dashed hsla(120,25%,75%,0.5);
		background-color: hsla(120,20%,20%,0.5);
	}
</style>