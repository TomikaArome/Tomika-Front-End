<template>
	<div id="tomika-content-stream-control">
		<section :class="{ collapsed: data.connectionCollapsed }">
			<h1 @click="set('connectionCollapsed', !data.connectionCollapsed)">Connection</h1>
			<div>
				<div class="panel panel-button" @click="connect" :class="{ on: connStatus >= CONN.SUCCESSFUL, pending:
				connStatus === CONN.PENDING }">
					<font-awesome-icon icon="power-off"></font-awesome-icon>
					Connect
				</div>
				<div class="panel panel-button" @click="connectObs" :class="{ on: connStatus >= CONN.OBS_SUCCESSFUL,
				pending: connStatus === CONN.OBS_PENDING, faded: connStatus < CONN.SUCCESSFUL }">
					<font-awesome-icon icon="power-off"></font-awesome-icon>
					Connect OBS
				</div>
				<div class="panel" :class="{ faded: connStatus <= CONN.PENDING }">
					<input type="text" :value="data.obsHost" placeholder="OBS host" @change="set('obsHost', $event.target.value)">
					<input type="password" :value="obsPassword" placeholder="OBS password" @change="obsPassword =
					$event.target.value">
				</div>
				<div class="connect-info">
					<div><font-awesome-icon :spin="connStatus === CONN.PENDING" :icon="connStatus === CONN.PENDING ?
					'spinner' : (connStatus >= CONN.SUCCESSFUL ? 'check' : 'times')"></font-awesome-icon>
						WebSocket connection to back-end</div>
					<div><font-awesome-icon :spin="connStatus === CONN.OBS_PENDING" :icon="connStatus === CONN.OBS_PENDING
					? 'spinner' : (connStatus === CONN.OBS_SUCCESSFUL ? 'check' : 'times')"></font-awesome-icon>
						WebSocket connection to OBS</div>
				</div>
			</div>
		</section>
		<section :class="{ faded: connStatus < CONN.OBS_SUCCESSFUL, collapsed: data.sceneCollapsed }">
			<h1 @click="set('sceneCollapsed', !data.sceneCollapsed)">Scenes</h1>
			<div>
				<div class="panel panel-button" v-for="(scene, key) in data.scenes" :class="{ on: scene.name ===
				data.sceneActive }" @click="set('sceneActive', scene.name)" :key="key">
					<font-awesome-icon :icon="scene.icon"></font-awesome-icon>
					{{ scene.name }}
				</div>
			</div>
		</section>
		<section :class="{ faded: connStatus < CONN.SUCCESSFUL, collapsed: data.generalCollapsed }">
			<h1 @click="set('generalCollapsed', !data.generalCollapsed)">General</h1>
			<div>
				<div class="panel panel-button" :class="{ on: data.socialActive }" @click="set('socialActive', !data.socialActive)">
					<font-awesome-icon icon="at"></font-awesome-icon>
					Social
				</div>
				<div class="panel panel-button" :class="{ on: data.micActive, faded: connStatus < CONN.OBS_SUCCESSFUL
				}" @click="set('micActive', !data.micActive)">
					<font-awesome-icon icon="microphone"></font-awesome-icon>
					Microphone
				</div>
				<div class="panel panel-button" :class="{ on: data.discordActive, faded: connStatus <
				CONN.OBS_SUCCESSFUL }" @click="set('discordActive', !data.discordActive)">
					<font-awesome-icon :icon="['fab', 'discord']"></font-awesome-icon>
					Discord
				</div>
			</div>
		</section>
		<section :class="{ faded: connStatus < CONN.SUCCESSFUL, collapsed: data.brbCollapsed }">
			<h1 @click="set('brbCollapsed', !data.brbCollapsed)">BRB screen</h1>
			<div>
				<div class="panel panel-button" :class="{ on: data.brbActive }" @click="set('brbActive', !data.brbActive)">
					<font-awesome-icon icon="mug-hot"></font-awesome-icon>
					BRB screen
				</div>
				<div class="panel">
					<input type="text" :value="data.brbBigMessage" placeholder="Big message" @change=
							"set('brbBigMessage', $event.target.value)">
					<input type="text" :value="data.brbSmallMessage" placeholder="Small message" @change=
							"set('brbSmallMessage', $event.target.value)">
				</div>
			</div>
		</section>
		<section :class="{ faded: connStatus < CONN.SUCCESSFUL, collapsed: data.bingoCollapsed }">
			<h1 @click="set('bingoCollapsed', !data.bingoCollapsed)">Bingo</h1>
			<div>
				<div class="panel panel-button" :class="{ on: data.bingoActive }" @click="set('bingoActive', !data.bingoActive)">
					<font-awesome-icon icon="th"></font-awesome-icon>
					Bingo
				</div>
				<div class="panel" :class="{ faded: !data.bingoActive }">
					<div v-for="(bingoObj, key) in data.bingoNames" :key="key" class="bingo-info-line"
						:class="{ 'bingo-line-visible': bingoObj.visible }">
						<button class="bingo-line-visibility" @click="setBingoNames(key, 'visible', !bingoObj.visible)">
							<font-awesome-icon :icon="bingoObj.visible ? 'eye' : 'eye-slash'"></font-awesome-icon>
						</button>
						<div class="bingo-colour-selector">
							<button v-for="colour in bingoColours" :key="colour" class="bingo-colour"
								:class="'bingo-colour-' + colour + (bingoObj.colour === colour ? ' selected' : '')"
								@click="setBingoNames(key, 'colour', colour)"></button>
						</div>
						<input type="text" :value="bingoObj.name" placeholder="Name"
							@change="setBingoNames(key, 'name', $event.target.value)">
						<input type="text" :value="bingoObj.pfpUrl" placeholder="Profile picture URL"
							@change="setBingoNames(key, 'pfpUrl', $event.target.value)">
						<button class="bingo-line-remove" @click="setBingoNames(key, 'remove')">
							<font-awesome-icon icon="trash"></font-awesome-icon>
						</button>
					</div>
					<button class="bingo-line-add" @click="setBingoNames(-1, 'add')">
						<font-awesome-icon icon="plus"></font-awesome-icon> Add participant
					</button>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
	// Import dependencies
	import io from 'socket.io-client';
	import Vue from 'vue';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faPowerOff, faWifi, faSpinner, faTimes, faCheck, faMugHot, faAdjust, faMusic, faDesktop, faMicrophone,
		faAt, faTh, faEye, faEyeSlash, faTrash, faPlus, faTv, faPalette } from '@fortawesome/free-solid-svg-icons';
	import { faDiscord } from '@fortawesome/free-brands-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

	// Font awesome
	library.add(faPowerOff, faWifi, faSpinner, faTimes, faCheck, faMugHot, faAdjust, faMusic, faDesktop, faMicrophone,
		faDiscord, faAt, faTh, faEye, faEyeSlash, faTrash, faPlus, faTv, faPalette);
	Vue.component('font-awesome-icon', FontAwesomeIcon);

	export default {
		name: "tomika-content-stream-control",
		data() {
			return {
				socket: null,
				connStatus: 0,
				obsPassword: '',
				data: {
					// Connection
					connectionCollapsed: false,
					obsHost: '127.0.0.1:4444',
					// Scene
					sceneCollapsed: false,
					scenes: [],
					sceneActive: '',
					// General
					generalCollapsed: false,
					socialActive: false,
					micActive: false,
					discordActive: false,
					// BRB
					brbCollapsed: false,
					brbActive: false,
					brbBigMessage: 'Taking a quick break',
					brbSmallMessage: 'I\'ll be back soon!',
					// Bingo
					bingoCollapsed: true,
					bingoNames: [
						{ visible: true, colour: 'red', name: '', 'pfpUrl': '' },
						{ visible: true, colour: 'blue', name: '', 'pfpUrl': '' }
					]
				},
				bingoColours: ['orange', 'red', 'blue', 'green', 'purple', 'navy', 'teal', 'brown', 'pink', 'yellow']
			}
		},
		methods: {
			/**
			 * Connects the user to the backend via websocket
			 */
			connect() {
				if (!this.socket) {
					try {
						// Connection to the backend websocket
						this.connStatus = this.CONN.PENDING;
						this.socket = io(`${this.$store.state.app.backEnd}/stream-control`);

						/*---------------------------*
						 | Connection related events |
						 *---------------------------*/

						// Triggers when the websocket connection to the backend has successfully established
						this.socket.on('connect', () => {
							this.connStatus = this.CONN.SUCCESSFUL;
						});
						// This event brings back the status from "obs pending" to simply "connection successful", but without obs
						this.socket.on('connectObsFailed', () => {
							this.connStatus = this.CONN.SUCCESSFUL;
						});
						this.socket.on('connectObsSuccessful', () => {
							this.connStatus = this.CONN.OBS_SUCCESSFUL;
						});
						// Triggers when the server disconnects the client
						this.socket.on('disconnect', () => {
							this.onDisconnect();
						});
						this.socket.on('disconnectObs', () => {
							this.connStatus = this.CONN.SUCCESSFUL;
						});

						/*--------------*
						 | Other events |
						 *--------------*/

						// This event receives the data of the stream controller document
						this.socket.on('doc', (data) => {
							for (const [propName, propValue] of Object.entries(data)) {
								this.$set(this.data, propName, propValue);
							}
						});

					} catch (err) {
						// Nothing to do here
					}
				} else {
					this.onDisconnect();
				}
			},

			/**
			 * Event to be fired when the client is disconnected from the server. This could be initiated either by the
			 * client or the server
			 */
			onDisconnect() {
				// Disconnect the client (even if the server may have already done this)
				this.socket.disconnect();
				// Clear the socket object
				this.socket = null;
				// Reset the connection status back to "ready", where it's once again ready to reconnect
				this.connStatus = this.CONN.READY;
			},

			/**
			 * Connects to OBS
			 */
			connectObs() {
				if (this.connStatus === this.CONN.SUCCESSFUL) {
					this.connStatus = this.CONN.OBS_PENDING;
					this.socket.emit('connectObs', { host: this.data.obsHost, password: this.obsPassword });
				} else {
					this.connStatus = this.CONN.SUCCESSFUL;
					this.socket.emit('disconnectObs');
				}
			},

			/**
			 * Updates a property
			 * @param propName The name of the property
			 * @param propValue The value of the property
			 */
			set(propName, propValue) {
				if (this.connStatus >= this.CONN.SUCCESSFUL) {
					let newObj = Object.assign({}, this.data);
					newObj[propName] = propValue;
					this.socket.emit('set', newObj);
				}
			},

			/**
			 * Creates a new object with one modification in the bingoInfo property
			 * @param key The key of the bingo line to modify
			 * @param propName The name of the property in the object to change
			 * @param propValue The value to change to
			 */
			setBingoNames(key, propName, propValue) {
				let newObj = {};
				if (propName === 'remove') {
					newObj = Object.assign({}, this.data.bingoNames);
					delete newObj[key];
				} else if (propName === 'add') {
					newObj = Object.values(this.data.bingoNames);
					newObj.push({ visible: true, colour: 'orange', name: '', 'pfpUrl': '' })
				} else {
					newObj = Object.assign({}, this.data.bingoNames);
					newObj[key][propName] = propValue;
				}
				this.set('bingoNames', newObj);
			}
		},
		created() {
			// Create constants for the connection statuses
			this.CONN = {
				READY: 0, // OBS info was acquired using a fetch request, ready to connect
				PENDING: 1, // Websocket connection to the backend pending
				SUCCESSFUL: 2, // Websocket connection to the backend successful, only actions that don't require OBS can be performed
				OBS_PENDING: 3, // Websocket connection from the backend to OBS pending
				OBS_SUCCESSFUL: 4, // Websocket connection from the backend to OBS successful
			};
			this.connStatus = this.CONN.READY;
		}
	}
</script>

<style scoped>
#tomika-content-stream-control {
	display: flex;
	flex-direction: column;
	align-items: stretch;
	user-select: none;
}
section {
	display: flex;
	flex-direction: row;
}
section > h1 {
	font-family: "Roboto Condensed", Roboto, Arial, sans-serif;
	margin: 0;
	padding: 8px 12px;
	font-size: 16px;
	writing-mode: vertical-rl;
	text-align: center;
	transform: rotate(180deg);
	cursor: pointer;
}
section.collapsed > h1 {
	writing-mode: initial;
	transform: initial;
	padding: 12px 16px;
	flex-direction: row;
	width: 100%;
	text-align: left;
}
section > div {
	display: flex;
	flex-direction: row;
	padding: 4px 4px 4px 0;
	align-items: flex-start;
}
section.collapsed > div {
	display: none;
}
section:nth-of-type(2n) {
	background-color: hsla(0,0%,100%,0.05);
}
.faded.panel, .faded .panel {
	opacity: 0.3;
	pointer-events: none;
}
.connect-info {
	display: flex;
	flex-direction: column;
	justify-content: center;
	padding-left: 8px;
	color: hsl(0,0%,80%);
	align-self: center;
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
	min-height: 100px;
	box-sizing: border-box;
	padding: 8px 16px;
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
	white-space: nowrap;
}
.panel svg {
	font-size: 2.5em;
	margin-bottom: 8px;
}
.panel-button {
	cursor: pointer;
	padding: 16px;
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
	margin: 2px;
	min-width: 200px
}

/*-------*
 | Bingo |
 *-------*/

.bingo-info-line {
	display: flex;
	flex-direction: row;
	align-items: center;
}
.bingo-info-line:not(.bingo-line-visible) > *:not(.bingo-line-visibility) {
	opacity: 0.3;
	pointer-events: none;
}
.bingo-line-visibility, .bingo-line-remove, .bingo-line-add {
	box-sizing: border-box;
	border-radius: 4px;
	margin: 0 4px;
	background-color: hsl(180,10%,25%);
	width: 28px;
	height: 28px;
	padding: 0;
}
.bingo-line-add {
	width: auto;
	padding: 0 12px;
}
.bingo-line-visible .bingo-line-visibility {
	background-color: hsl(180,100%,30%);
}
.bingo-line-visibility svg, .bingo-line-remove svg, .bingo-line-add svg {
	font-size: 10px;
	margin: 0;
}
.bingo-colour-selector {
	display: flex;
	flex-wrap: wrap;
	width: 70px;
	margin: 0 4px;
	border-radius: 4px;
	overflow: hidden;
}
.bingo-colour {
	width: 14px;
	height: 14px;
	padding: 0;
	border-radius: 0;
	opacity: 0.2;
	transition: opacity 100ms;
}
.bingo-colour:after { content: none; }
.bingo-colour.selected, .bingo-colour:hover {
	opacity: 1;
}
.bingo-colour-orange { background-image: linear-gradient(#FF9C12, #F98E1E 60%, #D0800F); }
.bingo-colour-red { background-image: linear-gradient(#FF4944, #DA4440 60%, #CE302C); }
.bingo-colour-blue { background-image: linear-gradient(#409CFF, #37A1DE 60%, #088CBD); }
.bingo-colour-green { background-image: linear-gradient(#31D814, #00B500 60%, #20A00A); }
.bingo-colour-purple { background-image: linear-gradient(#822dbf, #7120ab); }
.bingo-colour-navy { background-image: linear-gradient(#0d48b5, #022b75); }
.bingo-colour-teal { background-image: linear-gradient(#419695, #2e7372); }
.bingo-colour-brown { background-image: linear-gradient(#ab5c23, #6d3811); }
.bingo-colour-pink { background-image: linear-gradient(#ed86aa, #cc6e8f); }
.bingo-colour-yellow { background-image: linear-gradient(#d8d014, #c1ba0b); }

</style>