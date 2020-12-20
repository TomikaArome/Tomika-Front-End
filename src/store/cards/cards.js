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
		actionsQueue: [],
		actionsQueueInProgress: false,
		actionsQueueSkip: false,
		acknowledgementRemainingPlayerIds: [],
		acknowledgementTitle: '',

		// Player related properties
		selfId: '',
		hostId: '',
		playerIdOrder: [],
		currentPlayerId: '',

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
		currentPlayer: (state) => { return state.players[state.currentPlayerId] || {}; },
		/**
		 * This is the index of the player who's holding this card, assuming the self player is always index 0
		 * Therefore, a player who plays just before the self player will have the largest index value (equal to the
		 * number of players - 1
		 */
		relativePlayerIndex: (state) => (playerId) => {
			if (!playerId || playerId === state.selfId) { return 0; }
			const ownerIndex = state.playerIdOrder.indexOf(playerId);
			const selfIndex = state.playerIdOrder.indexOf(state.selfId);
			return (ownerIndex + (state.playerIdOrder.length - selfIndex)) % state.playerIdOrder.length;
		},
		playerAngle: (state, getters) => (playerId) => {
			if (!playerId || playerId === state.selfId) { return -(Math.PI / 2); }
			return getters.playerCount === 2
				? (Math.PI / 2)
				: (Math.PI - (Math.PI * ((getters.relativePlayerIndex(playerId) - 1) / (getters.playerCount - 2))));
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
		setRound: (state, round) => { state.round = round; },
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
		addToActionsQueue: (state, newActionsArray) => {
			// Validate the parameter
			if (!(newActionsArray instanceof Array)) { return; }
			state.actionsQueue.push(...newActionsArray);
		},
		shiftActionsQueue: (state) => { state.actionsQueue.shift(); },
		setActionsQueueInProgress: (state, inProgress) => { state.actionsQueueInProgress = !!inProgress; },
		setActionsQueueSkip: (state, skip) => { state.actionsQueueSkip = !!skip; },
		setAcknowledgementRemainingPlayerIds: (state, playerIdsArray) => { state.acknowledgementRemainingPlayerIds = playerIdsArray; },
		setAcknowledgementTitle: (state, title) => { state.acknowledgementTitle = title; },

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
		setCurrentPlayerId: (state, playerId) => { state.currentPlayerId = playerId; },

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
			let newCardGroupData = Object.assign({}, state.cardGroups[cardGroupData.cardGroupId] || { cardGroupId: cardGroupData.cardGroupId });
			['role', 'playerId', 'ordered', 'cardIdOrder', 'hidden'].forEach(propName => {
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
		connect: ({ state, rootState, getters, commit, dispatch }) => {
			try {
				// Attempt to establish a connection to the backend
				commit('setSocket', io(`${rootState.app.backEnd}/cards`));

				// --- CONNECTION RELATED EVENTS ---

				state.socket.on('connect', () => { commit('gameSelectionChangeStep', 0); });
				state.socket.on('connect_error', () => { commit('gameSelectionChangeStep', -1); });
				state.socket.on('disconnect', () => { commit('reset'); });

				// --- GAME SELECTION RELATED EVENTS ---

				state.socket.on('listGames', (data) => {
					// Check that the selected game, if there is any, is still available to join
					if (state.selectedGameId) {
						// Find the game in the new array
						let game = data.find(e => e.id === state.selectedGameId);
						if (!game || !game.joinable) {
							commit('gameSelectionChangeStep', 0);
						}
					}
					commit('setGames', data);
				});
				state.socket.on('joinGame', (data) => {
					commit('gameSelectionChangeStep', 0);
					commit('setPlayers', data.players);
					commit('setPlayerIdOrder', data.playerIdOrder);
					commit('setSelfId', data.selfId);
					commit('setHostId', data.hostId);
				});
				state.socket.on('joinGameError', (errorMessage) => { commit('setJoinGameError', errorMessage); });
				state.socket.on('leaveGame', () => {
					commit('reset');
					state.socket.emit('listGames');
				});
				state.socket.on('addPlayer', (data) => {
					commit('addPlayer', data.player);
					commit('setPlayerIdOrder', data.playerIdOrder);
				});
				state.socket.on('removePlayer', (data) => {
					commit('removePlayer', data.id);
					commit('setPlayerIdOrder', data.playerIdOrder);
					commit('setHostId', data.hostId);
				});
				state.socket.on('setNickname', ({ id, newNickname }) => {
					commit('setNicknameError', '');
					commit('setNickname', { playerId: id, newNickname: newNickname });
				});
				state.socket.on('nicknameError', (errorMessage) => {
					commit('setNicknameError', errorMessage);
					setTimeout(() => { commit('setNicknameError', ''); }, 10000);
					commit('setChosenNickname', getters.self.nickname);
				});
				state.socket.on('setColour', ({ id, newColour }) => { commit('setColour', { playerId: id, newColour: newColour }); });
				state.socket.on('reorderPlayers', ({ playerIdOrder }) => { commit('setPlayerIdOrder', playerIdOrder); });
				state.socket.on('setGameModule', ({ gameModuleId }) => { commit('setGameModuleId', gameModuleId); });

				/**
				 * The game event is the event received when the server is communicating changes in the flow of the
				 * specific game chosen. The data received is an array of actions. Each action is an object with a
				 * property called "actionType" which determines what must be done to fulfill the changes that the
				 * server communicated
				 * @param actionsArray The array of objects holding the actions to be performed
				 */
				state.socket.on('gameEvent', async (newActionsArray) => {
					// Check if the actions queue is currently empty so we know we have to start processing actions
					// again
					const startProcessing = state.actionsQueue.length === 0;
					// Add the received array of actions to the actions queue
					commit('addToActionsQueue', newActionsArray);
					if (startProcessing) { dispatch('processAction'); }
				});

			} catch (err) {
				// Nothing to do here
			}
		},

		disconnect: ({ state, commit }) => {
			state.socket.emit('leaveGame');
			state.socket.disconnect();
			commit('reset');
		},

		/**
		 * Processes the next action in the actions queue. These are some of the generic action types:
		 *  - start: Sets the game as in progress
		 *  - cardGroup: Updates the information of a specific card group
		 *  - card: Updates the information of a specific card
		 *  - playing: Updates the game with the player who's currently playing as well as which cards are playable
		 */
		processAction: async (context) => {
			// Get the first element of the queue
			const action = context.state.actionsQueue[0];
			if (!action) { return; }
			// Flag the queue as being in progress
			context.commit('setActionsQueueInProgress', true);
			// Process the action
			switch (action.actionType) {
				case 'start':
					context.commit('setInProgress', true);
					context.commit('setLeftDrawerVisible', false);
					break;
				case 'round':
					context.commit('setRound', action.round);
					break;
				case 'acknowledgement':
					context.commit('setAcknowledgementRemainingPlayerIds', action.remainingPlayerIds);
					if (action.acknowledgementTitle) { context.commit('setAcknowledgementTitle', action.acknowledgementTitle); }
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
				case 'playing':
					if (action.hasOwnProperty('playableCards')) {
						for (let cardId of Object.keys(context.state.cards)) {
							context.commit('setCard', {
								cardId: cardId,
								playable: action.playableCards.indexOf(cardId) > -1
							});
						}
					}
					if (action.hasOwnProperty('currentPlayerId')) { context.commit('setCurrentPlayerId', action.currentPlayerId); }
					break;
				default:
					// Any action not listed here will be a module specific action
					if (typeof action.actionType === 'string' && context.getters.gameModule.actions &&
						typeof context.getters.gameModule.actions[action.actionType] === 'function') {
						await context.getters.gameModule.actions[action.actionType](context, action);
					}
					break;
			}
			// Remove this first action to make sure it isn't processed again
			context.commit('shiftActionsQueue');
			// Check the queue still has actions to process so we can process the next one
			if (context.state.actionsQueue.length > 0) {
				if (action.delayNextAction && !context.state.actionsQueueSkip) { await wait(100); }
				context.dispatch('processAction');
			} else {
				context.commit('setActionsQueueInProgress', false);
				// Queue is empty: the temporary skip flag can be reset so that future actions that are added to the
				// queue are played once again with an animation
				context.commit('setActionsQueueSkip', false);
			}
		}
	}
}