<template>
	<div id="tomika-content-stream-control">
		<h1>Connection</h1>
		<div class="panel-row">
			<div class="panel panel-button" @click="connect" :class="{ on: obsConnected, pending: obsConnectionPending, faded: !readyToConnect }">
				<font-awesome-icon icon="power-off"></font-awesome-icon>
				Connect
			</div>
			<div class="connect-info" :class="{ faded: obsConnected }">
				<div class="obs-host-div">
					OBS host:
					<input type="text" :value="obsHost" @change="obsHost = $event.target.value">
					OBS password:
					<input type="password" @change="obsPassword = $event.target.value">
				</div>
				<div>Make sure OBS is open, then press on "Connect" to establish a WebSocket connection</div>
				<div><font-awesome-icon :spin="connectionPending" :icon="connectionPending ? 'spinner' : (socket ? 'check' : 'times')"></font-awesome-icon>WebSocket connection to back-end</div>
				<div><font-awesome-icon :spin="obsConnectionPending" :icon="obsConnectionPending ? 'spinner' : (obsConnected ? 'check' : 'times')"></font-awesome-icon>WebSocket connection to OBS</div>
			</div>
		</div>
		<div :class="{ faded: !obsConnected }">
			<h1>BRB screen</h1>
			<div class="panel-row">
				<div class="panel panel-button" :class="{ on: brbActive }" @click="onBrbToggle">
					<font-awesome-icon icon="mug-hot"></font-awesome-icon>
					BRB screen
				</div>
				<div class="panel">
					<input type="text" :value="brbBigMessage" placeholder="Big message" @change="onBrbBigMessageChange">
					<input type="text" :value="brbSmallMessage" placeholder="Small message" @change="onBrbSmallMessageChange">
				</div>
				<div class="panel panel-button" :class="{ on: brbTransparent }" @click="onBrbTransparencyToggle">
					<font-awesome-icon icon="adjust"></font-awesome-icon>
					Transparent
				</div>
			</div>
		</div>
	</div>
</template>

<script>
	// Import dependencies
	import io from 'socket.io-client';
	import Vue from 'vue';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faPowerOff, faSpinner, faTimes, faCheck, faMugHot, faAdjust } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
	import f from '../../requests/fetch';

	// Font awesome
	library.add(faPowerOff, faSpinner, faTimes, faCheck, faMugHot, faAdjust);
	Vue.component('font-awesome-icon', FontAwesomeIcon);

	export default {
		name: "tomika-content-stream-control",
		data() {
			return {
				socket: null,
				readyToConnect: false,
				connectionPending: false,
				obsHost: '127.0.0.1:4444',
				obsPassword: '',
				obsConnectionPending: false,
				obsConnected: false,
				brbActive: false,
				brbTransparent: true,
				brbBigMessage: 'Taking a quick break',
				brbSmallMessage: 'I\'ll be back soon!'
			}
		},
		methods: {
			connect() {
				if (!this.socket) {
					try {
						// Connection to the backend websocket
						this.socket = io(`${this.$store.state.app.backEnd}/stream-control`);
						this.connectionPending = true;
						this.obsConnectionPending = true;

						/*--------*
						 | Events |
						 *--------*/

						this.socket.on('connect', () => {
							this.connectionPending = false;
							// Connection to the OBS websocket
							this.socket.emit('connectObs', { host: this.obsHost, password: this.obsPassword });
						});

						this.socket.on('dataEvent', (data) => {
							this.obsConnectionPending = false;
							this.obsConnected = true;
							if (typeof data.brb == 'object') {
								if (typeof data.brb.active === 'boolean') { this.brbActive = data.brb.active; }
								if (typeof data.brb.transparent === 'boolean') { this.brbActive = data.brb.transparent; }
								if (typeof data.brb.bigMessage === 'string') { this.brbBigMessage = data.brb.bigMessage; }
								if (typeof data.brb.smallMessage === 'string') { this.brbSmallMessage = data.brb.smallMessage; }
							}
						});

						this.socket.on('connectObsFailed', () => {
							this.obsConnectionPending = false;
						});

						this.socket.on('updateBrb', (data) => {
							this.brbActive = data.active;
							this.brbTransparent = data.transparent;
							this.brbBigMessage = data.bigMessage;
							this.brbSmallMessage = data.smallMessage;
						});

					} catch (err) {
						// Nothing to do here
					}
				} else {
					this.socket.disconnect();
					this.socket = null;
					this.connectionPending = false;
					this.obsConnectionPending = false;
					this.obsConnected = false;
				}
			},
			onBrbToggle() {
				if (this.socket) { this.socket.emit('updateBrb', { active: !this.brbActive }); }
			},
			onBrbTransparencyToggle() {
				if (this.socket) { this.socket.emit('updateBrb', { transparent: !this.brbTransparent }); }
			},
			onBrbBigMessageChange(e) {
				if (this.socket) { this.socket.emit('updateBrb', { bigMessage: e.target.value }); }
			},
			onBrbSmallMessageChange(e) {
				if (this.socket) { this.socket.emit('updateBrb', { smallMessage: e.target.value }); }
			}
		},
		async mounted() {
			const obsHostRes = await f('/obs/host');
			if (obsHostRes.success) {
				this.obsHost = obsHostRes.o.obsHost;
				this.readyToConnect = true;
			}
		}
	}
</script>

<style scoped>
#tomika-content-stream-control {
	align-items: flex-start;
	padding: 8px;
}
.faded {
	opacity: 0.3;
	pointer-events: none;
}
h1 {
	margin: 0 0 0 8px;
	font-size: 20px;
}
.panel-row {
	display: flex;
	flex-direction: row;
}
.connect-info {
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding-left: 8px;
	color: hsl(0,0%,80%);
}
.connect-info > div {
	margin: 2px 0;
}
.connect-info svg {
	width: 24px;
}
.obs-host-div input {
	color: inherit;
	font-family: "Courier New", monospace;
	background-color: hsla(0,0%,100%,0.1);
	margin-right: 8px;
}
.panel {
	min-width: 100px;
	height: 100px;
	box-sizing: border-box;
	padding: 16px;
	margin: 4px;
	background-color: hsl(180,10%,30%);
	font-size: 16px;
	font-weight: bold;
	border-radius: 4px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	transition: background-color 100ms;
}
.panel svg {
	font-size: 2.5em;
	margin-bottom: 8px;
}
.panel-button {
	cursor: pointer;
}
.panel-button:hover {
	background-color: hsl(180,10%,35%);
}
.panel.on {
	background-color: hsl(180,100%,30%);
}
.panel-button.on:hover {
	background-color: hsl(180,100%,35%);
}
.panel.pending {
	background-color: hsl(30,30%,35%);
}
.panel input {
	border: 1px solid hsl(180,100%,10%);
	background-color: hsla(0,0%,100%,0.2);
	padding: 6px 8px;
	font-family: inherit;
	color: #ffffff;
	margin: 4px;
	min-width: 200px
}
</style>