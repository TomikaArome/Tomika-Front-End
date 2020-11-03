<template>
	<div id="tomika-content-ouistiti">
		<div class="game">
			<div class="left-drawer">
				<h1>Player options</h1>
				<div class="nickname-row">
					<input type="text" v-model="chosenNickname" @keyup="setNickname($event)">
					<button @click="setNickname">Change nickname</button>
				</div>
				<div class="colour-picker-row">
					<div v-for="(hslCode, colourName) in colours" :key="colourName" :style="{ backgroundColor: hslCode }"
					:class="{ taken: takenColours.indexOf(colourName) > -1 }" @click="setColour(colourName, takenColours.indexOf(colourName) > -1)">
						<font-awesome-icon v-if="selfPlayer && selfPlayer.colour === colourName" icon="check"></font-awesome-icon>
					</div>
				</div>
				<h1>Players</h1>
				<div class="player-list">
					<div v-for="(player, index) in playerOrder" :key="player.id">
						<ouistiti-player-graphic :id="player.id" :small="true" :colour="player.colour"></ouistiti-player-graphic>
						<div class="nickname">{{ player.nickname }}</div>
						<div class="host"><font-awesome-icon v-if="player.isHost" icon="crown"></font-awesome-icon></div>
						<div v-if="selfPlayer && selfPlayer.isHost" class="reorder-buttons">
							<div v-if="index !== 0" @click="reorderPlayers(playerOrder[index - 1].id, player.id)"><font-awesome-icon icon="chevron-up"></font-awesome-icon></div>
							<div class="spacer"></div>
							<div v-if="index !== playerOrder.length - 1" @click="reorderPlayers(player.id, playerOrder[index + 1].id)"><font-awesome-icon icon="chevron-down"></font-awesome-icon></div>
						</div>
					</div>
					<div v-for="n in 6 - playerIdOrder.length" :key="n" class="empty">
						<ouistiti-player-graphic :small="true" colour="black"></ouistiti-player-graphic>
						<div class="nickname">Waiting for players...</div>
					</div>
				</div>
			</div>
		</div>
		<div class="dark-screen" v-if="!inGame">
			<div class="game-selector">
				<transition :name="gameSelectionStep < gameSelectionPrevStep ? 'page-slide-right' : 'page-slide-left'" mode="out-in">
					<div v-if="gameSelectionStep === 0" key="0">
						<h1>Select game</h1>
						<div class="game-list">
							<ouistiti-game-details v-for="game in games" :key="game.id" @click.native="selectGame(game.id)" :game="game" :clickable="true"></ouistiti-game-details>
						</div>
						<div class="create-game-button" @click="gameSelectionChangeStep(1)">
							<div><font-awesome-icon icon="plus"></font-awesome-icon> Create new game</div>
						</div>
					</div>
					<div v-if="gameSelectionStep === 1" key="1">
						<ouistiti-game-details v-if="selectedGameId" :game="selectedGame"></ouistiti-game-details>
						<h1 v-else>Create new game</h1>
						<div class="ouistiti-form-row">
							<div>Nickname</div>
							<div><input type="text" v-model="chosenNickname" @keyup="createOrJoinSelectedGame($event)"></div>
						</div>
						<div class="ouistiti-form-row" v-if="!selectedGameId || selectedGame.passwordProtected">
							<div>Password</div>
							<div><input type="text" :placeholder="selectedGameId ? '' : 'Leave blank for no password'" v-model="password" @keyup="createOrJoinSelectedGame($event)"></div>
						</div>
						<tomika-block-message v-if="joinGameError" type="error">{{ joinGameError }}</tomika-block-message>
						<div class="game-selection-confirm">
							<span class="game-selection-cancel" @click="gameSelectionChangeStep(0)">
								<font-awesome-icon icon="chevron-left"></font-awesome-icon> Cancel
							</span>
							<div class="spacer"></div>
							<button class="green" @click="createOrJoinSelectedGame">{{ selectedGameId ? 'Join' : 'Create' }}!</button>
						</div>
					</div>
				</transition>
			</div>
		</div>
	</div>
</template>

<script>
	// Import dependencies
	import io from 'socket.io-client';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faPlus, faChevronLeft, faLock, faUsers, faCrown, faCheck, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';

	// Import components
	import OuistitiGameDetails from "./ouistiti-game-details";
	import TomikaBlockMessage from "../tomika-block-message";
	import OuistitiPlayerGraphic from "./ouistiti-player-graphic";

	// Font awesome
	library.add(faPlus, faChevronLeft, faLock, faUsers, faCrown, faCheck, faChevronUp, faChevronDown);

	export default {
		name: "tomika-content-ouistiti",
		components: {
			OuistitiPlayerGraphic,
			TomikaBlockMessage,
			OuistitiGameDetails
		},
		data() {
			return {
				socket: null,

				// Game selection
				games: [],
				gameSelectionStep: 0, // 0 = game selection, 1 = create game screen, 2 = join game screen
				gameSelectionPrevStep: 0,
				selectedGameId: '',
				chosenNickname: '',
				retrievedDiscordName: false,
				password: '',
				joinGameError: '',

				// Game
				inGame: false,
				totalCardCount: 32,
				totalRoundCount: 0,
				players: [],
				playerIdOrder: [],
				inProgress: false,

				// Colours
				colours: {
					red: 'hsl(0,75%,60%)',
					yellow: 'hsl(60,75%,60%)',
					green: 'hsl(120,75%,60%)',
					cyan: 'hsl(180,75%,60%)',
					blue: 'hsl(240,75%,60%)',
					magenta: 'hsl(300,50%,60%)',
					white: 'hsl(0,0%,60%)',
					black: 'hsl(0,0%,20%)'
				}

			}
		},
		computed: {
			selectedGame() {
				return this.games.find(e => e.id === this.selectedGameId);
			},
			playerOrder() {
				return this.playerIdOrder.reduce((acc, playerId) => {
					let player = this.players.find(p => p.id === playerId);
					if (player) { acc.push(player); }
					return acc;
				}, []);
			},
			selfPlayer() {
				return this.players.find(p => p.id === this.socket.id);
			},
			takenColours() {
				return Object.keys(this.colours).filter((c) => {
					let r = false;
					for (let p of this.players) { r = r || (p.id !== this.socket.id && p.colour === c); }
					return r;
				});
			}
		},
		methods: {
			gameSelectionChangeStep(step) {
				if (step === 0) { this.selectedGameId = ''; }
				this.password = '';
				this.joinGameError = '';
				this.gameSelectionPrevStep = this.gameSelectionStep;
				this.gameSelectionStep = step;
				if (!this.retrievedDiscordName && this.$store.getters['user/connected']) {
					this.chosenNickname = this.$store.getters['user/name'];
					this.retrievedDiscordName = true;
				}
			},
			createOrJoinSelectedGame(keyEvent) {
				if (keyEvent.type === 'keyup' && keyEvent.key !== 'Enter') { return; }
				if (this.selectedGameId) {
					// Join game
					this.socket.emit('joinGame', { id: this.selectedGameId, nickname: this.chosenNickname, password: this.password });
				} else {
					// Create game
					this.socket.emit('createGame', {nickname: this.chosenNickname, password: this.password});
				}
			},
			selectGame(id) {
				let game = this.games.find(g => g.id === id);
				if (game && game.joinable) {
					this.selectedGameId = id;
					this.gameSelectionChangeStep(1);
				}
			},
			setNickname(keyEvent) {
				if (keyEvent.type === 'keyup' && keyEvent.key !== 'Enter') { return; }
				this.socket.emit('setNickname', { nickname: this.chosenNickname })
			},
			setColour(colour, taken) {
				if (!taken) {
					this.socket.emit('setColour', { colour: colour });
				}
			},
			reorderPlayers(movingPlayerId, moveAfterPlayerId) {
				let data = {
					movingPlayerId: movingPlayerId,
					moveAfterPlayerId: moveAfterPlayerId,
				};
				if (movingPlayerId === this.playerIdOrder[0]) { data.newFirstPlayerId = moveAfterPlayerId; }
				this.socket.emit('reorderPlayers', data);
			}
		},
		mounted() {
			try {
				// Attempt to establish a connection to the backend
				this.socket = io(`${this.$store.state.app.backEnd}/ouistiti`);

				/*---------------------------*
				 | Connection related events |
				 *---------------------------*/

				// Triggers when the websocket connection to the backend has successfully established
				this.socket.on('connect', () => {
					// Nothing special to do here
				});

				/*------------------------*
				 | Game management events |
				 *------------------------*/

				this.socket.on('listGames', (data) => {
					// Check that the selected game, if there is any, is still available to join
					if (this.selectedGameId) {
						// Find the game in the new array
						let game = data.find(e => e.id === this.selectedGameId);
						if (!game || !game.joinable) {
							this.gameSelectionChangeStep(0);
						}
					}
					// Update the local games array
					this.games = data;
				});

				this.socket.on('joinGameError', (errorMessage) => {
					this.joinGameError = errorMessage;
				});

				this.socket.on('joinGameSuccess', (data) => {
					this.gameSelectionChangeStep(0);
					this.inGame = true;
					this.totalCardCount = data.totalCardCount;
					this.totalRoundCount = data.totalRoundCount;
					this.firstPlayerId = data.firstPlayerId;
					this.players = data.players;
					this.playerIdOrder = data.playerIdOrder;
				});

				this.socket.on('addPlayer', ({ player, playerIdOrder }) => {
					this.players.push(player);
					this.playerIdOrder = playerIdOrder;
				});

				this.socket.on('removePlayer', ({ id, playerIdOrder, hostId }) => {
					let index = this.players.findIndex(p => p.id === id);
					if (index > -1) { this.players.splice(index, 1); }
					this.playerIdOrder = playerIdOrder;
					let host = this.players.find(p => p.id === hostId);
					if (host) { host.isHost = true; }
				});

				this.socket.on('setNickname', ({ id, newNickname }) => {
					let player = this.players.find(p => p.id === id);
					if (player) { player.nickname = newNickname; }
				});

				this.socket.on('setColour', ({ id, newColour }) => {
					let player = this.players.find(p => p.id === id);
					if (player) { player.colour = newColour; }
				});

				this.socket.on('reorderPlayers', ({ playerIdOrder }) => {
					this.playerIdOrder = playerIdOrder;
				});

			} catch (error) {
				console.log('Error encountered with the websocket', error);
			}
		}
	}
</script>

<style scoped>
#tomika-content-ouistiti {
	height: calc(100% - 40px);
}
.game {
	width: 100%;
	height: 100%;
	background-color: hsl(120,30%,30%);
}

h1 {
	font-family: "Roboto Condensed", Arial, sans-serif;
	margin: 0;
}

/*-------------*
 | Left drawer |
 *-------------*/

.left-drawer {
	position: absolute;
	top: 0;
	left: 0;
	background-color: hsla(0,0%,0%,0.7);
	padding: 20px;
	height: calc(100% - 16px);
	width: 300px;
	margin: 8px;
	border-radius: 8px;
	overflow-y: scroll;
}
.left-drawer h1 {
	text-align: center;
	font-size: 18px;
	margin-bottom: 12px;
	padding: 8px 0;
	border: 1px solid hsl(0,0%,50%);
	border-left: none;
	border-right: none;
}
.left-drawer h1:not(:first-child) {
	margin-top: 12px;
}
.left-drawer .ouistiti-form-row {
	font-size: 16px;
}
.nickname-row {
	display: flex;
	flex-direction: row;
	align-items: center;
}
.nickname-row > button { width: 80px; margin-left: 8px; }
.nickname-row > input[type=text] {
	width: 100%;
	background-color: transparent;
	color: inherit;
	font-size: 20px;
	flex-grow: 1;
	align-self: stretch;
}
.colour-picker-row {
	display: flex;
	flex-direction: row;
	margin: 8px 0px;
}
.colour-picker-row > div {
	position: relative;
	height: 24px;
	flex-grow: 1;
	margin: 0 2px;
	border-radius: 4px;
	cursor: pointer;
	border: 3px solid hsla(0,0%,0%,0.5);
	overflow: hidden;
}
.colour-picker-row > div:after {
	content: "";
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	transition: background-color 100ms;
}
.colour-picker-row > div:hover:after {
	background-color: hsla(0,0%,100%,0.3);
}
.colour-picker-row > div:first-child { margin-left: 0; }
.colour-picker-row > div:last-child { margin-right: 0; }
.colour-picker-row > div > svg {
	position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
	color: hsla(0,0%,100%,0.7);
}
.colour-picker-row > div.taken {
	opacity: 0.2;
	cursor: not-allowed;
}
.player-list > div {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 4px;
}
.reorder-buttons {
	display: flex;
	flex-direction: column;
	margin-right: 2px;
	padding: 1px 0;
	align-self: stretch;
}
.reorder-buttons > div:not(.spacer) {
	font-size: 10px;
	padding: 2px 8px;
	border-radius: 4px;
	cursor: pointer;
	transition: background-color 100ms;
}
.reorder-buttons > div:not(.spacer):hover {
	background-color: hsla(0,0%,100%,0.2);
}
.player-list > div > .nickname {
	margin-left: 8px;
	font-size: 20px;
	flex-grow: 1;
	flex-shrink: 1;
	width: 50%;
	overflow-x: hidden;
	white-space: nowrap;
}
.player-list > div > .host {
	font-size: 14px;
	color: hsl(45,80%,60%);
	margin: 0 4px;
}
.player-list > .empty {
	opacity: 0.5;
}
.player-list > .empty > .nickname {
	font-size: 0.8em;
	color: hsl(0,0%,60%);
}

/*----------------*
 | Game selection |
 *----------------*/

.dark-screen {
	display: flex;
	align-items: center;
	justify-content: center;
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: hsla(0,0%,0%,0.3);
}
.game-selector {
	width: 400px;
	padding: 20px;
	background-color: hsla(0,0%,10%,0.8);
	border-radius: 12px;
	overflow: hidden;
}
.game-selector h1 {
	margin: 0 0 12px 0;
	color: hsl(0,0%,80%);
	text-align: center;
	font-size: 24px;
}
.create-game-button {
	position: relative;
	width: 100%;
	padding: 8px;
	cursor: pointer;
	transition: background-color 100ms, color 100ms;
	font-size: 20px;
	color: hsl(0,0%,70%);
}
.create-game-button div {
	border: 1px dashed hsl(0,0%,50%);
	border-radius: 8px;
	padding: 8px;
	width: 100%;
	text-align: center;
}
.create-game-button svg {
	font-size: 0.8em;
	margin-right: 0.5em;
}
.create-game-button:hover {
	background-color: hsla(0,0%,100%,0.05);
	border-radius: 8px;
	color: hsl(0,0%,100%)
}
.game-selection-confirm {
	display: flex;
	flex-direction: row;
	margin-top: 8px;
}
.spacer {
	flex-grow: 1;
}
.game-selection-cancel {
	padding: 8px 12px;
	color: hsl(0,0%,70%);
	transition: background-color 100ms, color 100ms;
	cursor: pointer;
	width: auto;
	border-radius: 8px;
}
.game-selection-cancel:hover {
	background-color: hsla(0,0%,100%,0.05);
	color: hsl(0,0%,100%);
}
.game-selection-cancel svg {
	font-size: 0.8em;
	margin-right: 0.5em;
}
.ouistiti-form-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 4px;
	font-size: 20px;
}
.ouistiti-form-row > div:nth-child(1) {
	width: 30%;
	text-align: right;
	padding: 4px 16px 4px 0;
}
.ouistiti-form-row > div:nth-child(2) {
	flex-grow: 1;
}
.ouistiti-form-row input[type=text] {
	background: transparent;
	color: inherit;
	width: 100%;
	font-size: inherit;
	padding: 8px;
}
.game-list {
	overflow-y: scroll;
	max-height: 40vh;
}
</style>