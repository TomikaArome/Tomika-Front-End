<template>
	<div class="tomika-popup" :class="{ borderless: $props.borderless }">
		<div v-if="title" class="tomika-popup-title-row">
			<h2 class="tomika-popup-title">{{ title }}</h2>
			<div class="spacer"></div>
			<div v-if="closeButtonAction" class="tomika-popup-close-button" @click="closeButtonAction">
				<font-awesome-icon icon="times"></font-awesome-icon>
			</div>
		</div>
		<div class="tomika-popup-container">
			<div class="tomika-popup-content">
				<component v-if="contentComponent" :is="content"></component>
				<div v-else class="tomika-popup-text"><slot></slot></div>
				<div class="tomika-popup-choices" v-if="filteredChoices.length">
					<button v-for="(choice, index) in filteredChoices" :key="index"
						@click="choice.buttonAction(closeButtonAction)">
						{{ choice.buttonText }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	/**
	 * This element merits explanation for its number of props:
	 * - title: Title of the popup, will display just above the content
	 * - text: Text to display inside the popup
	 * - contentComponent: The component that will be displayed
	 * - closeButtonAction: Function that will be triggered by the close button. If omitted, the close button will not
	 *     be displayed
	 * - choices: An array of objects representing the choices, with:
	 *   - buttonText: The text inside the button
	 *   - buttonClass: A class name to style the button
	 *   - buttonAction: A callback function for when the button is activated, the first parameter of this function is
	 *       the function to close the popup
	 */

	// Import dependencies
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faTimes } from '@fortawesome/free-solid-svg-icons';
	import store from '../store/store';

	// Font awesome
	library.add(faTimes);

	export default {
		name: "tomika-popup",
		data() {
			return {
				selectedTab: 0
			}
		},
		props: {
			title: String,
			contentComponent: Object,
			borderless: { type: Boolean, default: false },
			closeButtonAction: { type: Function, default() { store.commit('app/popPopup'); } },
			prompt: String,
			choices: Array
		},
		computed: {
			content() {
				return this.contentComponent || 'div';
			},
			filteredChoices() {
				let arr = this.choices ? this.choices.filter((choice) => {
					return typeof choice.buttonAction === 'function';
				}) : [];
				if (arr.length === 0) {
					arr.push({
						buttonText: 'OK',
						buttonAction: (close) => { close(); }
					});
				}
				return arr;
			}
		}
	}
</script>

<style scoped>
	.tomika-popup {
		display: flex;
		position: relative;
		flex-direction: column;
		background-color: hsl(0,0%,10%);
	}
	.tomika-popup:not(.borderless) {
		border: 1px solid hsl(180,25%,30%);
		border-radius: 16px;
		overflow: hidden;
	}
	.tomika-popup-container {
		display: flex;
		position: relative;
		flex-grow: 1;
		flex-direction: row;
		height: calc(100% - 40px);
	}
	.tomika-popup-title-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 0 0 0 20px;
		height: 40px;
		background-color: hsl(0,0%,5%);
	}
	.tomika-popup-title {
		margin: 0;
		font-size: 16px;
		text-shadow: -2px -2px hsla(0,0%,0%,1);
	}
	.tomika-popup-close-button {
		width: 25px;
		height: 25px;
		margin-right: 6px;
		border-radius: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		color: hsl(0,0%,80%);
		cursor: pointer;
		user-select: none;
		transition: background-color 150ms;
	}
	.tomika-popup-close-button:hover {
		background-color: hsl(0,25%,30%);
		color: hsl(0,25%,80%);
	}
	.tomika-popup-content {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		min-width: 200px;
		min-height: 100px;
		overflow-y: scroll;
		overflow-x: hidden;
	}
	.tomika-popup-content > :first-child {
		flex-grow: 1;
	}
	.tomika-popup-text {
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
		font-size: 16px;
		padding: 12px 24px;
		max-width: 400px;
	}
	.tomika-popup-choices {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		padding: 8px 0;
	}
	.tomika-popup-choices > button { margin: 0 4px }
	.tomika-popup-choices > button:first-child { margin-left: 16px; }
	.tomika-popup-choices > button:last-child { margin-right: 16px; }
</style>