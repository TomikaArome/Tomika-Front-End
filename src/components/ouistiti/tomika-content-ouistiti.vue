<template>
	<div id="tomika-content-ouistiti">
		<div class="game"></div>
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
					<div class="game-selection-form-row">
						<div>Nickname</div>
						<div><input type="text" v-model="chosenNickname"></div>
					</div>
					<div class="game-selection-form-row" v-if="!selectedGameId || selectedGame.passwordProtected">
						<div>Password</div>
						<div><input type="text" :placeholder="selectedGameId ? '' : 'Leave blank for no password'" v-model="password"></div>
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
</template>

<script>
	// Import dependencies
	import io from 'socket.io-client';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faPlus, faChevronLeft, faLock, faUsers } from '@fortawesome/free-solid-svg-icons';

	// Import components
	import OuistitiGameDetails from "./ouistiti-game-details";
	import TomikaBlockMessage from "../tomika-block-message";

	// Font awesome
	library.add(faPlus, faChevronLeft, faLock, faUsers);

	export default {
		name: "tomika-content-ouistiti",
		components: {
			TomikaBlockMessage,
			OuistitiGameDetails
		},
		data() {
			return {
				socket: null,
				games: [],
				gameSelectionStep: 0, // 0 = game selection, 1 = create game screen, 2 = join game screen
				gameSelectionPrevStep: 0,
				selectedGameId: '',
				chosenNickname: '',
				password: '',
				joinGameError: ''
			}
		},
		computed: {
			selectedGame() {
				return this.games.find(e => e.id === this.selectedGameId);
			}
		},
		methods: {
			gameSelectionChangeStep(step) {
				if (step === 0) { this.selectedGameId = ''; }
				this.password = '';
				this.joinGameError = '';
				this.gameSelectionPrevStep = this.gameSelectionStep;
				this.gameSelectionStep = step;
				if (this.$store.getters['user/connected']) {
					this.chosenNickname = this.$store.getters['user/name'];
				}
			},
			createOrJoinSelectedGame() {
				if (this.selectedGameId) {
					// Join game
					this.socket.emit('joinGame', { id: this.selectedGameId, nickname: this.chosenNickname, password: this.password });
				} else {
					// Create game
					this.socket.emit('createGame', {nickname: this.chosenNickname, password: this.password});
				}
			},
			selectGame(id) {
				this.selectedGameId = id;
				this.gameSelectionChangeStep(1);
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
					if (this.selectedGameId) { console.log(this.selectedGame.joinable); }
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

				this.socket.on('setNickname', (data) => {
					console.log(data.oldNickname + ' changed their name to ' + data.newNickname + ' (id: ' + data.id + ')');
				});

			} catch (error) {
				console.log('Error encountered with the websocket', error);
			}
		}
	}
</script>

<style scoped>
#tomika-content-ouistiti {
	display: flex;
	align-items: center;
	justify-content: center;
}
.game-selector {
	position: relative;
	width: 400px;
	padding: 20px;
	background-color: hsl(0,0%,17%);
	border-radius: 12px;
	overflow: hidden;
}
.game-selector h1 {
	margin: 0 0 12px 0;
	font-family: "Roboto Condensed", Arial, sans-serif;
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
.game-selection-form-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 4px;
}
.game-selection-form-row > div:nth-child(1) {
	width: 30%;
	text-align: right;
	padding: 4px 16px 4px 0;
	font-size: 20px;
}
.game-selection-form-row > div:nth-child(2) {
	flex-grow: 1;
}
.game-selection-form-row input[type=text] {
	background: transparent;
	color: inherit;
	width: 100%;
	font-size: 20px;
	padding: 8px;
}
.game-list {
	overflow-y: scroll;
	max-height: 40vh;
}
</style>