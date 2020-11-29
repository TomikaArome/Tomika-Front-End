// Import dependencies
import Vue from 'vue';
import io from 'socket.io-client';
import { wait } from '../util';

// Export store module
export default {
	namespaced: true,
	state: {
		// Socket
		socket: null,

		// Arrays
		games: [],
		players: {},
		cards: {},
		cardGroups: {},

		// Game progress
		inProgress: false,
		round: 1,
		phase: 'playing',

		selectedGameId: '',
		selfId: '',
		hostId: '',
		playerIdOrder: [],
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
		self: (state) => { return state.players[state.selfId] ? state.players[state.selfId] : {}; },
		host: (state) => { return state.players[state.hostId] ? state.players[state.hostId] : {}; },
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
			return Object.keys(state.cards).filter(cardId => state.cards[cardId].cardGroupId === cardGroupId).map(cardId => {
				return { cardId: cardId, ...state.cards[cardId] };
			});
		}
	},
	mutations: {
		reset: (state) => {
			state.games = [];
			state.selectedGameId = '';
			state.selfId = '';
			state.hostId = '';
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

		// Game related mutations
		setInProgress: (state, inProgress) => { state.inProgress = inProgress; },

		// Player related mutations
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

		// Card related mutations
		setCard: (state, cardData) => {
			if (typeof cardData.cardId !== 'string') { return; }
			let newCardData = state.cards[cardData.cardId] || { cardId: cardData.cardId };
			['suit', 'value', 'faceUp', 'cardGroupId', 'nextCardId'].forEach(propName => {
				if (typeof cardData[propName] !== 'undefined') { newCardData[propName] = cardData[propName]; }
			});
			Vue.set(state.cards, cardData.cardId, newCardData);
		},
		deleteCard: (state, cardId) => {
			Vue.delete(state.cards, cardId);
		},

		// Card group related mutations
		setCardGroup: (state, cardGroupData) => {
			if (typeof cardGroupData.cardGroupId !== 'string') { return; }
			let newCardGroupData = state.cardGroups[cardGroupData.cardGroupId] || { cardId: cardGroupData.cardGroupId };
			['role', 'firstCardId', 'playerId'].forEach(propName => {
				if (typeof cardGroupData[propName] !== 'undefined') { newCardGroupData[propName] = cardGroupData[propName]; }
			});
			Vue.set(state.cardGroups, cardGroupData.cardGroupId, newCardGroupData);
		},
		deleteCardGroup: (state, cardGroupId) => {
			Vue.delete(state.cardGroups, cardGroupId);
		}
	},
	actions: {

		/**
		 * Connects to the backend websocket using the cards namespace. This mutation also defines the event handlers.
		 * Callback functions for each of these events can be passed as a payload
		 */
		connect: ({ state, rootState, commit }, eventHandlers) => {
			// Validate payload
			for (let i in eventHandlers) {
				if (eventHandlers.hasOwnProperty(i) && typeof eventHandlers[i] !== 'function') { throw 'Invalid event handler for "' + i + '"'; }
			}

			try {
				// Attempt to establish a connection to the backend
				// TODO - change to cards namespace
				commit('setSocket', io(`${rootState.app.backEnd}/cards`));

				// Object of event handlers as defined by this store module, intended for changes in data
				// The reason we split the two is to avoid clutter in the component
				const stateEventHandlers = {

					// --- Connection related events

					disconnect: () => { commit('reset'); },

					// --- Game management events

					listGames: (data) => { commit('setGames', data); },
					joinGame: (data) => {
						commit('setPlayers', data.players);
						commit('setPlayerIdOrder', data.playerIdOrder);
						commit('setSelfId', data.selfId);
						commit('setHostId', data.hostId);
					},
					leaveGame: () => {
						commit('reset');
						state.socket.emit('listGames');
					},
					addPlayer: (data) => {
						commit('addPlayer', data.player);
						commit('setPlayerIdOrder', data.playerIdOrder);
					},
					removePlayer: (data) => {
						commit('removePlayer', data.id);
						commit('setPlayerIdOrder', data.playerIdOrder);
						commit('setHostId', data.hostId);
					},
					setNickname: ({ id, newNickname }) => {
						commit('setNickname', { playerId: id, newNickname: newNickname });
					},
					setColour: ({ id, newColour }) => {
						commit('setColour', { playerId: id, newColour: newColour });
					},
					reorderPlayers: ({ playerIdOrder }) => {
						commit('setPlayerIdOrder', playerIdOrder);
					},

					/**
					 * The game event is the event received when the server is communicating changes in the flow of the
					 * specific game chosen. The data received is an array of actions. Each action is an object with a
					 * property called "actionType" which determines what must be done to fulfill the changes that the
					 * server communicated. These are some of the generic action types:
					 *  - card: Updates the information of a specific card
					 * @param actionsArray The array of objects holding the actions to be performed
					 */
					gameEvent: async (actionsArray) => {
						// Validate the parameter
						if (!(actionsArray instanceof Array)) { return; }
						// Cycle through each action
						for (let action of actionsArray) {
							switch (action.actionType) {
								case 'start':
									commit('setInProgress', true);
									break;
								case 'cardGroup':
									commit('setCardGroup', action);
									break;
								case 'card':
									commit('setCard', action);
									break;
								default:
									// Any action not listed here will be a module specific action
									// TODO
									break;
							}
							// Check whether or not to delay the next action
							if (action.delayNextAction) { await wait(100); }
						}
						/*console.log(Object.values(state.cards).reduce((acc, curr) => {
							let a = acc[curr.cardGroupId] || { role: state.cardGroups[curr.cardGroupId].role, n: 0 };
							a.n++;
							acc[curr.cardGroupId] = a;
							return acc;
						}, {}));*/
					}
				};

				// Merge the two object (both the one defined in this action and the one defined by the vue component
				for (let event of Object.keys({...stateEventHandlers, ...eventHandlers})) {
					let f = () => {};
					if (!stateEventHandlers.hasOwnProperty(event) && eventHandlers.hasOwnProperty(event)) { f = eventHandlers[event]; }
					else if (stateEventHandlers.hasOwnProperty(event) && !eventHandlers.hasOwnProperty(event)) { f = stateEventHandlers[event]; }
					else if (stateEventHandlers.hasOwnProperty(event) && eventHandlers.hasOwnProperty(event)) { f = (data) => {
						// The event handler defined by the component always comes first as it may be trying to adjust before the data is changed
						eventHandlers[event](data);
						stateEventHandlers[event](data);
					}; }
					state.socket.on(event, f);
				}

			} catch (err) {
				// Nothing to do here
			}
		}

	}
}