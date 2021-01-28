export default {
	cardGroupLayouts: {
		hand: 'hand',
		play: 'choice',
		trump: 'temp' // TODO - Replace this with an actual layout which fixes a position on the screen
	},
	clickCard: (store, card) => {
		store.state.cards.socket.emit('gameEvent', { gameEventType: 'playCard', cardId: card.cardId });
	},
	components: {
		options: 'tomika-cards-ouistiti-options'
	},
	actions: {
		totalCardCount: ({ commit }, action) => {
			commit('setGameModuleData', { key: 'totalCardCount', value: action.totalCardCount });
		}
	}
};