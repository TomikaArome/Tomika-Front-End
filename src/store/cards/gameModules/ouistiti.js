export default {
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