// Import dependencies
import Vue from 'vue';
import io from 'socket.io-client';
import { wait } from '../../util';

// Game modules
import gameModuleOuistiti from './gameModules/ouistiti';
const gameModules = {
	'game-module-ouistiti': gameModuleOuistiti
};

// Export store module
export default {
	namespaced: true,
	state: {
		// Socket
		socket: null,

		// Collections
		games: [],
		players: {},
		cards: {},
		cardGroups: {},

		// Game related properties
		gameModuleId: 'game-module-ouistiti',
		gameModuleData: {},
		inProgress: false,
		round: 1,
		phase: 'playing',

		// Player related properties
		selfId: '',
		hostId: '',
		playerIdOrder: [],

		// Game selection
		selectedGameId: '',
		gameSelectionStep: 0, // -1 = not connected, 0 = game selection, 1 = create game screen, 2 = join game screen
		gameSelectionPrevStep: 0,
		chosenNickname: '',
		retrievedDiscordName: false,
		password: '',
		joinGameError: '',
		nicknameError: '',

		// UI
		leftDrawerVisible: true,

		// TODO - Deprecated
		totalCardCount: 32,
		totalRoundCount: 18,

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
	},
	getters: {
		selectedGame: (state) => {
			return state.games.find(g => state.selectedGameId === g.id);
		},
		inGame: (state, getters) => { return getters.playerCount > 0; },
		self: (state) => { return state.players[state.selfId] || {}; },
		host: (state) => { return state.players[state.hostId] || {}; },
		isHost: (state) => { return state.selfId === state.hostId; },
		playerCount: (state) => { return state.playerIdOrder.length },
		playerOrder: (state) => {
			return state.playerIdOrder.reduce((acc, playerId) => {
				if (state.players[playerId]) { acc.push(state.players[playerId]); }
				return acc;
			}, []);
		},
		takenColours: (state) => {
			return Object.keys(state.colours).filter((c) => {
				return Object.values(state.players).reduce((r, p) => r || (p.id !== state.selfId && p.colour === c), false);
			});
		},
		cardGroupCards: (state) => (cardGroupId) => {
			// TODO - add sorting function
			const cardGroup = state.cardGroups[cardGroupId];
			if (!cardGroup) { return []; }
			// Case in which the card group is ordered: we simply have to map the cardIdOrder
			if (cardGroup.ordered) {
				return cardGroup.cardIdOrder.filter(cardId => {
					// Filter to check the card exists
					return state.cards[cardId];
				}).map(cardId => {
					// Map to retrieve all the data about the card
					return { cardId: cardId, ...state.cards[cardId] };
				});
			}
			// Otherwise we filter the cards array
			return Object.keys(state.cards).filter(cardId => {
				// Filter to check the card exists and is part of the card group
				return state.cards[cardId] && state.cards[cardId].cardGroupId === cardGroupId;
			}).map(cardId => {
				// Map to retrieve all the data about the card
				return { cardId: cardId, ...state.cards[cardId] };
			}).sort((/*card1, card2*/) => {
				// This sort function is used to sort by player preferences, such as order of cards in hand for example
				// This ordering should have no consequence on the gameplay, an ordered card group is used for that
				return 0;
			});
		},
		gameModule: (state) => { return gameModules[state.gameModuleId] || { components: {}, actions: {} }; }
	},
	mutations: {
		reset: (state) => {
			// TODO - complete
			state.games = [];
			state.selectedGameId = '';
			state.selfId = '';
			state.hostId = '';
			state.gameModuleId = 'game-module-generic';
			state.inProgress = false;
			state.players = [];
			state.playerIdOrder = [];
			state.trump = '';
			state.totalCardCount = 32;
			state.totalRoundCount = 18;
		},
		setSocket: (state, payload) => { state.socket = payload; },
		setSelectedGameId: (state, payload) => { state.selectedGameId = payload; },
		setGames: (state, payload) => { state.games = payload; },

		// --- GAME RELATED MUTATIONS ---

		setInProgress: (state, inProgress) => { state.inProgress = inProgress; },
		setGameModuleId: (state, gameModuleId) => {
			if (state.gameModuleId !== gameModuleId && gameModules[gameModuleId]) {
				state.gameModuleId = gameModuleId;
				state.gameModuleData = {};
			}
		},
		setGameModuleData: (state, { key, value }) => {
			if (typeof key === 'undefined') { state.gameModuleData = {}; }
			else {
				if (typeof value === 'undefined') {
					Vue.delete(state.gameModuleData, key);
				} else {
					Vue.set(state.gameModuleData, key, value);
				}
			}
		},

		// --- PLAYER RELATED MUTATIONS ---

		setPlayers: (state, payload) => {
			state.players = payload.reduce((acc, curr) => { acc[curr.id] = curr; return acc; }, {});
		},
		addPlayer: (state, payload) => { Vue.set(state.players, payload.id, payload); },
		removePlayer: (state, playerId) => { Vue.delete(state.players, playerId); },
		setPlayerIdOrder: (state, payload) => { state.playerIdOrder = payload; },
		setSelfId: (state, payload) => { state.selfId = payload; },
		setHostId: (state, payload) => { state.hostId = payload; },
		setNickname: (state, { playerId, newNickname }) => {
			if (state.players[playerId]) { state.players[playerId].nickname = newNickname; }
		},
		setColour: (state, { playerId, newColour }) => {
			if (state.players[playerId]) { state.players[playerId].colour = newColour; }
		},

		// --- CARD RELATED MUTATIONS ---

		setCard: (state, cardData) => {
			if (typeof cardData.cardId !== 'string') { return; }
			let newCardData = Object.assign({}, state.cards[cardData.cardId] || { cardId: cardData.cardId });
			['suit', 'value', 'faceUp', 'cardGroupId', 'playable'].forEach(propName => {
				if (typeof cardData[propName] !== 'undefined') {
					newCardData[propName] = cardData[propName];
				}
			});
			Vue.set(state.cards, cardData.cardId, newCardData);
		},
		deleteCard: (state, cardId) => {
			Vue.delete(state.cards, cardId);
		},

		// --- CARD GROUP RELATED MUTATIONS ---

		setCardGroup: (state, cardGroupData) => {
			if (typeof cardGroupData.cardGroupId !== 'string') { return; }
			let newCardGroupData = Object.assign({}, state.cardGroups[cardGroupData.cardGroupId] || { cardId: cardGroupData.cardGroupId });
			['role', 'playerId', 'ordered', 'cardIdOrder'].forEach(propName => {
				if (typeof cardGroupData[propName] !== 'undefined') { newCardGroupData[propName] = cardGroupData[propName]; }
			});
			Vue.set(state.cardGroups, cardGroupData.cardGroupId, newCardGroupData);
		},
		deleteCardGroup: (state, cardGroupId) => {
			Vue.delete(state.cardGroups, cardGroupId);
		},

		// --- GAME SELECTION RELATED MUTATIONS ---

		gameSelectionChangeStep: (state, step) => {
			if (step === 0) { state.selectedGameId = ''; }
			state.password = '';
			state.joinGameError = '';
			state.gameSelectionPrevStep = state.gameSelectionStep;
			state.gameSelectionStep = step;
		},
		setJoinGameError: (state, errorMessage) => { state.joinGameError = errorMessage; },
		setNicknameError: (state, errorMessage) => { state.nicknameError = errorMessage; },
		setChosenNickname: (state, nickname) => { state.chosenNickname = nickname; },
		setRetrievedDiscordName: (state) => { state.retrievedDiscordName = true; },

		// --- UI RELATED MUTATIONS ---

		setLeftDrawerVisible: (state, visible) => { state.leftDrawerVisible = visible; }

	},
	actions: {

		/**
		 * Connects to the backend websocket using the cards namespace. This mutation also defines the event handlers.
		 * Callback functions for each of these events can be passed as a payload
		 */
		connect: (context) => {
			try {
				// Attempt to establish a connection to the backend
				context.commit('setSocket', io(`${context.rootState.app.backEnd}/cards`));

				// --- CONNECTION RELATED EVENTS ---

				context.state.socket.on('connect', () => { context.commit('gameSelectionChangeStep', 0); });
				context.state.socket.on('connect_error', () => { context.commit('gameSelectionChangeStep', -1); });
				context.state.socket.on('disconnect', () => { context.commit('reset'); });

				// --- GAME SELECTION RELATED EVENTS ---

				context.state.socket.on('listGames', (data) => {
					// Check that the selected game, if there is any, is still available to join
					if (context.state.selectedGameId) {
						// Find the game in the new array
						let game = data.find(e => e.id === context.state.selectedGameId);
						if (!game || !game.joinable) {
							context.commit('gameSelectionChangeStep', 0);
						}
					}
					context.commit('setGames', data);
				});
				context.state.socket.on('joinGame', (data) => {
					context.commit('gameSelectionChangeStep', 0);
					context.commit('setPlayers', data.players);
					context.commit('setPlayerIdOrder', data.playerIdOrder);
					context.commit('setSelfId', data.selfId);
					context.commit('setHostId', data.hostId);
				});
				context.state.socket.on('joinGameError', (errorMessage) => { context.commit('setJoinGameError', errorMessage); });
				context.state.socket.on('leaveGame', () => {
					context.commit('reset');
					context.state.socket.emit('listGames');
				});
				context.state.socket.on('addPlayer', (data) => {
					context.commit('addPlayer', data.player);
					context.commit('setPlayerIdOrder', data.playerIdOrder);
				});
				context.state.socket.on('removePlayer', (data) => {
					context.commit('removePlayer', data.id);
					context.commit('setPlayerIdOrder', data.playerIdOrder);
					context.commit('setHostId', data.hostId);
				});
				context.state.socket.on('setNickname', ({ id, newNickname }) => {
					context.commit('setNicknameError', '');
					context.commit('setNickname', { playerId: id, newNickname: newNickname });
				});
				context.state.socket.on('nicknameError', (errorMessage) => {
					context.commit('setNicknameError', errorMessage);
					setTimeout(() => { context.commit('setNicknameError', ''); }, 10000);
					context.commit('setChosenNickname', context.getters.self.nickname);
				});
				context.state.socket.on('setColour', ({ id, newColour }) => { context.commit('setColour', { playerId: id, newColour: newColour }); });
				context.state.socket.on('reorderPlayers', ({ playerIdOrder }) => { context.commit('setPlayerIdOrder', playerIdOrder); });
				context.state.socket.on('setGameModule', ({ gameModuleId }) => { context.commit('setGameModuleId', gameModuleId); });

				/**
				 * The game event is the event received when the server is communicating changes in the flow of the
				 * specific game chosen. The data received is an array of actions. Each action is an object with a
				 * property called "actionType" which determines what must be done to fulfill the changes that the
				 * server communicated. These are some of the generic action types:
				 *  - card: Updates the information of a specific card
				 * @param actionsArray The array of objects holding the actions to be performed
				 */
				context.state.socket.on('gameEvent', async (actionsArray) => {
					// Validate the parameter
					if (!(actionsArray instanceof Array)) { return; }
					// Cycle through each action
					for (let action of actionsArray) {
						switch (action.actionType) {
							case 'start':
								context.commit('setInProgress', true);
								context.commit('setLeftDrawerVisible', false);
								break;
							case 'cardGroup':
								context.commit('setCardGroup', action);
								break;
							case 'card':
								context.commit('setCard', action);
								for (let cardGroupId of Object.keys(action.cardGroupCardIdOrder || {})) {
									context.commit('setCardGroup', {
										cardGroupId: cardGroupId,
										cardIdOrder: action.cardGroupCardIdOrder[cardGroupId]
									});
								}
								break;
							case 'playableCards':
								for (let cardId of Object.keys(context.state.cards)) {
									context.commit('setCard', { cardId: cardId, playable: action.playableCards.indexOf(cardId) > -1 });
								}
								break;
							default:
								// Any action not listed here will be a module specific action
								if (typeof action.actionType === 'string' && action.actionType.length > 0 &&
									typeof context.state.gameModule.actions[action.actionType] === 'function') {
									await context.state.gameModule.actions[action.actionType](context, action);
								}
								break;
						}
						// Check whether or not to delay the next action
						if (action.delayNextAction) { await wait(100); }
					}
				});

			} catch (err) {
				// Nothing to do here
			}
		},

		disconnect: ({ state, commit }) => {
			state.socket.emit('leaveGame');
			state.socket.disconnect();
			commit('reset');
		}

	}
}