<template>
	<div v-if="$store.state.app.popupStack.length" id="tomika-popup-stack">
		<div class="popup-screen" v-for="(popup, popupStackIndex) in $store.state.app.popupStack"
			:key="popupStackIndex" @click="clickPopupScreen(!popup.noScreenClose, $event)">
			<tomika-popup v-bind="popup">{{ popup.text }}</tomika-popup>
		</div>
	</div>
</template>

<script>
import tomikaPopup from './tomika-popup';

export default {
	name: "tomika-popup-stack",
	components: {
		tomikaPopup
	},
	methods: {
		clickPopupScreen(screenAction, event) {
			if (screenAction && /popup-screen/.test(event.target.className)) {
				if (typeof screenAction === "function") { screenAction(); }
				else { this.$store.commit('app/popPopup'); }
			}
		}
	}
}
</script>

<style scoped>
#tomika-popup-stack {
	position: fixed;
	z-index: 999999;
	top: 40px;
	left: 0;
	width: 100%;
	height: calc(100% - 40px);
}
#tomika-popup-stack .popup-screen {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}
#tomika-popup-stack .popup-screen:last-child {
	background-color: hsla(0,0%,0%,0.7);
}
@media (min-width: 501px) {
	.tomika-popup {
		max-width: 80%;
		max-height: 80%;
	}
}
@media (max-width: 500px) {
	#tomika-popup-stack *.big-popup {
		border: none;
		border-radius: 0;
		width: 100%;
		height: 100%;
	}
}
</style>