<template>
	<div class="tomika-popup">
		<div class="tomika-popup-tabs">
			<span></span>
			<div v-for="(tab, tabIndex) in tabs" :key="tabIndex"
				:class="{ 'tomika-popup-tab': !tab.spacer, 'tomika-popup-tab-spacer': tab.spacer, selected: selectedTab
				=== tabIndex }" @click="selectedTab = tabIndex">
				<div v-if="!tab.spacer && (tab.image || tab.icon)" class="tomika-popup-tab-icon">
					<img v-if="tab.image" :src="tab.image">
					<font-awesome-icon :icon="tab.icon" v-if="tab.icon && !tab.image"></font-awesome-icon>
				</div>
				<div class="tomika-popup-tab-text" v-if="!tab.spacer && tab.text">
					<h2>{{ tab.text }}</h2>
					<div v-if="tab.subtext" class="subtext">{{ tab.subtext }}</div>
				</div>
			</div>
		</div>
		<div class="tomika-popup-container">
			<div class="tomika-popup-title-row">
				<h2 class="tomika-popup-title">{{ title }}</h2>
				<div class="spacer"></div>
				<div class="tomika-popup-close-button"><div><font-awesome-icon icon="times"></font-awesome-icon></div></div>
			</div>
			<div class="tomika-popup-content">
				<component :is="content"></component>
			</div>
		</div>
	</div>
</template>

<script>
	/**
	 * This element merits explanation for its number of props:
	 *  - title: title of the popup, will display just above the content [REQUIRED]
	 *  - ONE OF THE FOLLOWING:
	 *    - contentComponent: the component that will be displayed (no tabs solution)
	 *    OR
	 *    - tabs: an array of objects with:
	 *      - contentComponent: the component that will be displayed when the tab is selected
	 *      - text: the text describing what the tab is about
	 *    OR
	 *    - prompt: a question or prompt to be displayed in the popup
	 *    - choices: an array of objects representing the choices for the prompt, with:
	 *      - buttonText: the text inside the button
	 *      - buttonClass: a class name to style the button
	 *      - buttonTrigger: a callback function for when the button is activated
	 */

	// Import dependencies
	import Vue from 'vue';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faTimes } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

	// Font awesome
	library.add(faTimes);
	Vue.component('font-awesome-icon', FontAwesomeIcon);

	export default {
		name: "tomika-popup",
		data() {
			return {
				selectedTab: 0
			}
		},
		props: {
			title: String,
			tabs: Array
		},
		computed: {
			content() {
				if (this.tabs) {
					return this.tabs[this.selectedTab].contentComponent || this.contentComponent || 'div';
				}
				return this.contentComponent || 'div';
			}
		}
	}
</script>

<style scoped>
	.tomika-popup {
		display: flex;
		flex-direction: row;
	}
	.tomika-popup-tabs {
		display: flex;
		flex-direction: column;
		margin-right: -1px;
		position: relative;
		z-index: 1;
		padding: 16px 0;
	}
	.tomika-popup-tabs > span {
		display: block;
		height: 40px;
	}
	.tomika-popup-tab-spacer {
		margin-top: 20px;
	}
	.tomika-popup-tab {
		position: relative;
		display: flex;
		align-items: center;
		background-color: hsl(0,0%,10%);
		border: 1px solid hsl(180,25%,30%);
		border-right: none;
		border-radius: 25px 0 0 25px;
		cursor: pointer;
		user-select: none;
		height: 50px;
		min-width: 25px;
		margin: 2px 0;
	}
	.tomika-popup-tab:nth-of-type(1) { margin-top: 0; }
	.tomika-popup-tab:nth-last-of-type(1) { margin-bottom: 0; }
	.tomika-popup-tab > * {
		opacity: 0.5;
		transition: opacity 150ms;
	}
	.tomika-popup-tab:hover > *, .tomika-popup-tab.selected > * {
		opacity: 1;
	}
	.tomika-popup-tab.selected > .tomika-popup-tab-icon {
		background-color: hsla(0,0%,100%,0.1);
	}
	.tomika-popup-tab-icon {
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
		top: 0;
		left: 0;
		height: 48px;
		width: 48px;
		border-radius: 100%;
		overflow: hidden;
		font-size: 24px;
		transition: background-color 150ms;
	}
	.tomika-popup-tab-icon img {
		width: 100%;
	}
	.tomika-popup-tab-text {
		position: relative;
		z-index: 1;
		margin: 0 8px 0 16px;
		white-space: nowrap;
	}
	.tomika-popup-tab-icon + .tomika-popup-tab-text {
		margin-left: 58px;
	}
	.tomika-popup-tab-text > h2 {
		margin: 0;
		font-size: 16px;
		color: hsl(0,0%,80%);
		line-height: 20px;
	}
	.tomika-popup-tab-text > .subtext {
		color: hsl(0,0%,50%);
		font-size: 12px;
	}
	.tomika-popup-container {
		display: flex;
		flex-direction: column;
	}
	.tomika-popup-title-row {
		display: flex;
		flex-direction: row;
		padding: 0 20px;
		height: 40px;
	}
	.tomika-popup-title {
		margin: 0;
		font-size: 20px;
		text-shadow: -2px -2px hsla(0,0%,0%,1);
	}
	.tomika-popup-close-button {
		width: 30px;
		height: 15px;
		position: relative;
		z-index: 1;
		box-sizing: border-box;
		align-self: flex-end;
		color: hsl(0,0%,80%);
		border: 1px solid hsl(180,25%,30%);
		border-bottom: none;
		border-radius: 15px 15px 0 0;
		cursor: pointer;
		user-select: none;
	}
	.tomika-popup-close-button > div {
		background-color: hsl(0,0%,10%);
		border-radius: 15px;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 28px;
		height: 28px;
		transition: background-color 150ms;
	}
	.tomika-popup-close-button > div:hover {
		background-color: hsl(0,25%,30%);
		color: hsl(0,25%,80%);
	}
	.tomika-popup-content {
		background-color: hsl(0,0%,10%);
		border: 1px solid hsl(180,25%,30%);
		border-radius: 16px;
		flex-grow: 1;
	}
</style>