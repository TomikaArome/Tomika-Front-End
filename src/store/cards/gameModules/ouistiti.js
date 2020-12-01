export default {
	totalCardCount: ({ commit }, action) => {
		commit('setGameModuleData', { key: 'totalCardCount', value: action.totalCardCount });
	}
};