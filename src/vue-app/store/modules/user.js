const state = {

    user: {
      name:'',
    },
  
  } 
  
  const mutations = {
    setName(state, payload) {
      state.user.name = payload;
  
    },

  }
  
  const getters = {
  
    name(state) {
      return state.name;
    }, 
  }
  
  const actions = {
  
  
    async setName({ commit, state }, payload) {
      commit('setName', payload)
  
    },
  }
  
  export default {
    state,
    mutations,
    actions,
    getters
  }