<template>
	<div class="tomika-cards-games-selector">
		<div class="game-selector">
			<transition :name="gameSelectionStep < gameSelectionPrevStep ? 'page-slide-right' : 'page-slide-left'" mode="out-in">
				<div v-if="gameSelectionStep === -1" :key="-1">
					<h1>Not connected</h1>
					<div style="text-align: center">Backend may not be available</div>
				</div>
				<div v-if="gameSelectionStep === 0" :key="0">
					<h1>Select game</h1>
					<div class="game-list">
						<tomika-cards-game-details v-for="game in games" :key="game.id" @click.native="selectGame(game)" :game="game" :clickable="true"></tomika-cards-game-details>
					</div>
					<div class="create-game-button" @click="$store.commit('cards/gameSelectionChangeStep', 1)">
						<div><font-awesome-icon icon="plus"></font-awesome-icon> Create new game</div>
					</div>
				</div>
				<div v-if="gameSelectionStep === 1" :key="1">
					<tomika-cards-game-details v-if="selectedGameId" :game="selectedGame"></tomika-cards-game-details>
					<h1 v-else>Create new game</h1>
					<div class="cards-form-row">
						<div>Nickname</div>
						<div><input type="text" :value="chosenNickname" @input="setChosenNickname($event.target.value)"
							@keydown="checkSubmit($event)"></div>
					</div>
					<div class="cards-form-row" v-if="!selectedGame || selectedGame.passwordProtected">
						<div>Password</div>
						<div><input type="text" :placeholder="selectedGameId ? '' : 'Leave blank for no password'"
							:value="password" @input="setPassword($event.target.value)" @keydown="checkSubmit($event)"></div>
					</div>
					<tomika-block-message v-if="joinGameError" type="error">{{ joinGameError }}</tomika-block-message>
					<div class="game-selection-confirm">
								<span class="game-selection-cancel" @click="$store.commit('cards/gameSelectionChangeStep', 0)">
									<font-awesome-icon icon="chevron-left"></font-awesome-icon> Cancel
								</span>
						<div></div>
						<button class="green" @click="createOrJoinSelectedGame">{{ selectedGameId ? 'Join' : 'Create' }}!</button>
					</div>
				</div>
			</transition>
		</div>
	</div>
</template>

<script>
	// Import dependencies
	import { mapState, mapGetters, mapMutations } from 'vuex';
	import { library } from '@fortawesome/fontawesome-svg-core';
	import { faPlus, faLock, faUsers, faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

	// Import components
	import tomikaCardsGameDetails from "./tomika-cards-game-details";
	import tomikaBlockMessage from "../tomika-block-message";

	// Font awesome
	library.add(faPlus, faLock, faUsers, faChevronRight, faChevronLeft);

	export default {
		name: 'tomika-cards-games-selector',
		components: {
			tomikaCardsGameDetails,
			tomikaBlockMessage
		},
		computed: {
			...mapState('cards', ['socket', 'games', 'gameSelectionStep', 'gameSelectionPrevStep', 'selectedGameId',
				'chosenNickname', 'retrievedDiscordName', 'password', 'joinGameError', 'chosenNickname', 'password']),
			...mapGetters('cards', ['selectedGame'])
		},
		methods: {
			...mapMutations('cards', ['gameSelectionChangeStep', 'setChosenNickname', 'setPassword', 'setRetrievedDiscordName']),
			checkSubmit(keyEvent) {
				if (keyEvent.key === 'Enter') { this.createOrJoinSelectedGame(); }
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
			selectGame(game) {
				if (game.joinable) {
					this.$store.commit('cards/setSelectedGameId', game.id);
					this.gameSelectionChangeStep(1);
				}
			}
		},
		mounted() {
			// Checks if Discord name is already available
			if (this.$store.getters['user/connected']) {
				this.setChosenNickname(this.$store.getters['user/name']);
				this.setRetrievedDiscordName();
			}
			// If not, watch for it to change
			this.$watch(() => { return this.$store.getters['user/name']; }, (newVal) => {
				if (!this.retrievedDiscordName && this.chosenNickname === '') {
					this.setChosenNickname(newVal);
					this.setRetrievedDiscordName();
				}
			});
		}
	}
</script>

<style scoped>
h1, h2 {
	font-family: "Roboto Condensed", Arial, sans-serif;
	margin: 0;
}
.tomika-cards-games-selector {
	display: grid;
	place-items: center;
	position: absolute;
	top: 0;
	left: 0;
	z-index: 1;
	width: 100%;
	height: 100%;
	background-color: hsla(0, 0%, 0%, 0.3);
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
	display: grid;
	grid-template-columns: auto 1fr auto;
	margin-top: 8px;
}
.game-selection-cancel {
	padding: 8px 12px;
	color: hsl(0,0%,70%);
	transition: background-color 100ms, color 100ms;
	cursor: pointer;
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
.cards-form-row {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin-bottom: 4px;
	font-size: 20px;
}
.cards-form-row > div:nth-child(1) {
	width: 30%;
	text-align: right;
	padding: 4px 16px 4px 0;
}
.cards-form-row > div:nth-child(2) {
	flex-grow: 1;
}
.cards-form-row input[type=text] {
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