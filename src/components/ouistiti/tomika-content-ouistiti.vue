<template>
	<div id="tomika-content-ouistiti">
		<div class="game" :class="{ 'is-host': selfPlayer && selfPlayer.isHost }">
			<div class="drawer left-drawer" :style="{ transform: 'translateX(' + (leftDrawerVisible ? '0' : '-300px') + ')' }">
				<h1>Player options</h1>
				<section>
					<div class="nickname-row">
						<input type="text" v-model="chosenNickname" @keyup="setNickname($event)">
						<button @click="setNickname">Change nickname</button>
					</div>
					<tomika-block-message v-if="nicknameError" type="error" :small="true">{{ nicknameError }}</tomika-block-message>
					<div class="colour-picker-row">
						<div v-for="(hslCode, colourName) in colours" :key="colourName" :style="{ backgroundColor: hslCode }"
						:class="{ taken: takenColours.indexOf(colourName) > -1 }" @click="setColour(colourName, takenColours.indexOf(colourName) > -1)">
							<font-awesome-icon v-if="selfPlayer && selfPlayer.colour === colourName" icon="check"></font-awesome-icon>
							<font-awesome-icon v-else-if="takenColours.indexOf(colourName) > -1" icon="times"></font-awesome-icon>
						</div>
					</div>
				</section>
				<h1>Players</h1>
				<section>
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
				</section>
				<h1>Game options</h1>
				<section>
					<div>Total number of cards:<template v-if="!selfPlayer || !selfPlayer.isHost"> {{ totalCardCount }}</template></div>
					<div class="total-card-count-row" v-if="selfPlayer && selfPlayer.isHost">
						<div v-for="n in [32,36,40,44,48,52]" :key="n" :class="{ selected: totalCardCount === n, invalid:
						isInvalidTotalCardCount(n) }" @click="setTotalCardCount(n)">{{ n }}</div>
					</div>
					<div>Available cards:</div>
					<div class="available-cards-row">
						<div v-for="i in ['A','K','Q','J','10','9','8','7','6','5','4','3','2'].slice(0, Math.floor(totalCardCount / 4))" :key="i">{{ i }}</div>
					</div>
					<div>Total number of rounds: {{ totalRoundCount }}</div>
				</section>
			</div>
			<div class="drawer-tab" :style="{ transform: 'rotate(90deg) translate(-32px, ' + (leftDrawerVisible ? '-300px' : '0') + ')' }" @click="leftDrawerVisible = !leftDrawerVisible">
				<font-awesome-icon :icon="leftDrawerVisible ? 'chevron-down' : 'chevron-up'"></font-awesome-icon>
				<span>Options / Player list</span>
			</div>
		</div>
		<div class="dark-screen" v-if="!inGame">
			<div class="game-selector">
				<transition :name="gameSelectionStep < gameSelectionPrevStep ? 'page-slide-right' : 'page-slide-left'" mode="out-in">
					<div v-if="gameSelectionStep === -1" key="-1">
						<h1>Not connected</h1>
						<div style="text-align: center">Backend may not be available</div>
					</div>
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
	import socketIoJsonParser from 'socket.io-json-parser';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faPlus, faLock, faUsers, faCrown, faCheck, faTimes, faChevronUp, faChevronDown, faChevronRight,
		faChevronLeft } from '@fortawesome/free-solid-svg-icons';

	// Import components
	import OuistitiGameDetails from "./ouistiti-game-details";
	import TomikaBlockMessage from "../tomika-block-message";
	import OuistitiPlayerGraphic from "./ouistiti-player-graphic";

	// Font awesome
	library.add(faPlus, faLock, faUsers, faCrown, faCheck, faTimes, faChevronUp, faChevronDown, faChevronRight,
		faChevronLeft);

	// Initial data
	let initialData = {
		// UI
		leftDrawerVisible: true,

		// Game selection
		games: [],
		gameSelectionStep: -1, // -1 = not connected, 0 = game selection, 1 = create game screen, 2 = join game screen
		gameSelectionPrevStep: 0,
		selectedGameId: '',
		chosenNickname: '',
		retrievedDiscordName: false,
		password: '',
		joinGameError: '',

		// Game
		inGame: false,
		nicknameError: '',
		totalCardCount: 32,
		totalRoundCount: 18,
		players: [],
		playerIdOrder: [],
		inProgress: false,
	};

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
				...initialData,

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
			reset() {
				for (let key in initialData) {
					if (initialData.hasOwnProperty(key)) {
						this.$set(this, key, initialData[key]);
					}
				}
			},
			isInvalidTotalCardCount(n) {
				let r = true;
				switch (this.players.length) {
					case 4: r = false; break;
					case 5: if (n === 40) { r = false; } break;
					case 6: if (n === 48) { r = false; } break;
				}
				return r;
			},
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
			},
			setTotalCardCount(cardCount) {
				// Only emit an event if the number of players in the lobby is 4, as that's the only time it matters
				if (this.players.length === 4) {
					this.socket.emit('setTotalCardCount', { totalCardCount: cardCount });
				}
			}
		},
		mounted() {
			try {
				// Attempt to establish a connection to the backend
				this.socket = io(`${this.$store.state.app.backEnd}/ouistiti`, {
					parser: socketIoJsonParser
				});

				/*---------------------------*
				 | Connection related events |
				 *---------------------------*/

				// Triggers when the websocket connection to the backend has successfully established
				this.socket.on('connect', () => {
					this.gameSelectionChangeStep(0);
				});

				this.socket.on('disconnect', () => {
					this.reset();
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

				this.socket.on('addPlayer', (data) => {
					this.players.push(data.player);
					this.playerIdOrder = data.playerIdOrder;
					this.totalCardCount = data.totalCardCount;
					this.totalRoundCount = data.totalRoundCount;
				});

				this.socket.on('removePlayer', (data) => {
					let index = this.players.findIndex(p => p.id === data.id);
					if (index > -1) { this.players.splice(index, 1); }
					this.playerIdOrder = data.playerIdOrder;
					let host = this.players.find(p => p.id === data.hostId);
					if (host) { host.isHost = true; }
					this.totalCardCount = data.totalCardCount;
					this.totalRoundCount = data.totalRoundCount;
				});

				this.socket.on('setNickname', ({ id, newNickname }) => {
					let player = this.players.find(p => p.id === id);
					if (player) { player.nickname = newNickname; }
					this.nicknameError = '';
				});

				this.socket.on('nicknameError', (errorMessage) => {
					this.nicknameError = errorMessage;
					setTimeout(() => { this.nicknameError = ''; }, 10000);
					if (this.selfPlayer) { this.chosenNickname = this.selfPlayer.nickname; }
				});

				this.socket.on('setColour', ({ id, newColour }) => {
					let player = this.players.find(p => p.id === id);
					if (player) { player.colour = newColour; }
				});

				this.socket.on('reorderPlayers', ({ playerIdOrder }) => {
					this.playerIdOrder = playerIdOrder;
				});

				this.socket.on('setTotalCardCount', ({ totalCardCount, totalRoundCount }) => {
					this.totalCardCount = totalCardCount;
					this.totalRoundCount = totalRoundCount;
				});

			} catch (error) {
				// Nothing to do here
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
	background-color: hsl(200,30%,30%);
}

h1, h2 {
	font-family: "Roboto Condensed", Arial, sans-serif;
	margin: 0;
}

/*---------*
 | Drawers |
 *---------*/

.drawer {
	position: absolute;
	top: 0;
	left: 0;
	background-color: hsl(200,30%,10%);
	height: 100%;
	width: 300px;
	overflow-y: scroll;
	transition: transform 200ms;
}
.drawer > section {
	padding: 8px 12px;
}
.drawer h1 {
	text-align: center;
	font-size: 18px;
	margin: 8px 0;
	padding: 8px 0;
	background-color: hsl(200,20%,15%);
	border: 2px solid hsla(200,20%,30%,0.5);
	border-left: none;
	border-right: none;
	background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAAoCAYAAABEm8fXAAAACXBIWXMAAAsTAAALEwEAmpwYAAAGsmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIwLTExLTA0VDIwOjUxOjQ0WiIgeG1wOk1vZGlmeURhdGU9IjIwMjAtMTEtMDRUMjA6NTM6MThaIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIwLTExLTA0VDIwOjUzOjE4WiIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjE1MDYzMWMzLTExZmItMTM0MC1hODcwLWM3ZmEzZGVkNDk1NiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDozMTYyNTlhYy0yMjdkLWZmNGQtOGU4NS1mODM0YzFjNWM4MjciIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjM2OTRlMDllLTNjNmEtYjE0ZS1hYWFiLTY5MjBkZjQ2YTQzYyIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmRmMGJmZTQ2LWMxM2ItMjk0Zi1iY2E3LTkzMjViMjQ4N2M0NSIgc3RFdnQ6d2hlbj0iMjAyMC0xMS0wNFQyMDo1MTo0NFoiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozMTYyNTlhYy0yMjdkLWZmNGQtOGU4NS1mODM0YzFjNWM4MjciIHN0RXZ0OndoZW49IjIwMjAtMTEtMDRUMjA6NTM6MThaIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPjAwN0JDREQwNzkxMjNFOEJFQ0FFRkI3Mzc5NkNBQjdFPC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+kZP6LQAAB+tJREFUeJztnc1y00gQx3/y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');
}
.drawer h2 {
	font-size: 16px;
	margin-bottom: 4px;
}
.drawer h1:first-child {
	margin-top: 0;
	border-top: none;
}
.drawer .ouistiti-form-row {
	font-size: 16px;
}
.drawer::-webkit-scrollbar {
	width: 0;
}
.drawer:after {
	content: "";
	height: 100%;
	position: absolute;
	top: 0;
	border-right: 4px solid hsla(200,50%,0%,0.3);
}
.drawer-tab {
	position: absolute; top: 0; left: 0;
	background-color: hsl(200,30%,10%);
	border: 4px solid hsla(200,50%,0%,0.3);
	height: 32px;
	border-left: none;
	border-bottom: none;
	padding: 4px 20px 8px 20px;
	border-top-right-radius: 8px;
	white-space: nowrap;
	cursor: pointer;
	transform-origin: 0 100%;
	transition: transform 200ms, background-color 100ms;
}
.drawer-tab:hover {
	background-color: hsl(200,30%,12%);
}
.drawer-tab svg {
	margin-right: 8px;
}

/*-------------*
 | Left drawer |
 *-------------*/

.left-drawer:after {
	right: 0;
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
.colour-picker-row > div:not(.taken):hover:after {
	background-color: hsla(0,0%,100%,0.3);
}
.colour-picker-row > div:first-child { margin-left: 0; }
.colour-picker-row > div:last-child { margin-right: 0; }
.colour-picker-row > div > svg {
	position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%);
	color: hsla(0,0%,100%,0.7);
}
.colour-picker-row > div.taken {
	opacity: 0.5;
	cursor: not-allowed;
}
.colour-picker-row > div.taken > svg {
	font-size: 20px;
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
.total-card-count-row {
	display: flex;
	flex-direction: row;
	margin: 4px 0;
}
.total-card-count-row > div {
	flex-grow: 1;
	text-align: center;
	font-size: 18px;
	transition: background-color 100ms, opacity 100ms;
	margin: 0 2px;
	padding: 4px;
	border-radius: 8px;
	cursor: not-allowed;
}
.total-card-count-row > div:first-child { margin-left: 0; }
.total-card-count-row > div:last-child { margin-right: 0; }
.total-card-count-row > div:not(.invalid).selected, .total-card-count-row > div:not(.invalid):hover {
	background-color: hsla(0,0%,100%,0.2);
	cursor: pointer;
}
.total-card-count-row > div.invalid {
	opacity: 0.5;
}
.available-cards-row {
	display: flex;
	flex-direction: row;
	flex-wrap: wrap;
	margin: 4px 0;
}
.available-cards-row > div {
	width: 20px;
	height: 28px;
	background-color: hsl(0,0%,80%);
	color: #000000;
	border-radius: 4px;
	margin: 2px;
	display: flex;
	align-items: center;
	justify-content: center;
}
.available-cards-row > div:nth-child(2n) {
	color: hsl(0,50%,50%);
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