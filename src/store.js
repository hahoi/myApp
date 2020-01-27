import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  device: "",
  userId: sessionStorage.getItem('uid')=== "undefined" ? "" : sessionStorage.getItem('uid') ,
  user:null,
  projectEndDate: "2025-07-31", //專案結束日期
  loading: true,  // this.$store.state.loading
  LevelOneID:"1234567890abc",  // this.$store.state.LevelOneID 
  //權限控管
  // role: null,
  newRouter: [],
  workItemData:{},
  mustUpdate: false,
}
const getters = {
  device: state => state.device,
  userId: state => state.userId,
  user: state => state.user,
  projectEndDate: state => state.projectEndDate, 
  loading: state => state.loading,
  // role: state => state.user.role,
  newRouter: state => state.newRouter,
  workItemData: state => state.workItemData,
  mustUpdate: state => state.mustUpdate,
}
const mutations = {
  setLoading(state,loading){
    state.loading = loading
  },
  storeDevice(state,device){
    state.device = device
  },
  storeUserId(state, userId) {
    state.userId = userId;
  },
  storeUser(state, user) {
    state.user = user;
  },
  clearUserId(state) {
    state.userId = null;
  },
  setNewRouter(state, newRouter) {
    state.newRouter = newRouter
  },
  setWorkItemData(state, data) {
    state.workItemData = data
  },
  setmustUpdate(state, data) {
    state.mustUpdate = data
  },


}
const actions = {
  // saveRoles({ commit }, newRouter) {
  //     commit('setNewRouter', newRouter) //更新可使用的路由
  // },


    // ===依據角色role，儲存可使用的路由=====
  async saveRoles({ commit }, newRouter) {
    return new Promise((resolve) => {
      commit('setNewRouter', newRouter) //更新可使用的路由
      resolve(newRouter);
    }).catch((error)=> {
      console.log('catch:', error);
    });
  },
  async loginSet({ commit }, user) {
    try {
      return new Promise((resolve) => {
        // console.log(user.authId)
        commit('storeUserId', user.authId);
        commit('storeUser', user);
        sessionStorage.setItem('uid', user.authId) //存入 session 
        resolve(user);
      });
    }
    catch (error) {
      throw new Error(error)
    }

  },  // ======== 登出 ============
  async logout({ commit }) {
    try {
      return new Promise((resolve) => {
        commit('storeUserId', '')
        commit('storeUser', null)
        location.reload()
        sessionStorage.removeItem('uid');
        resolve();
      });
    }
    catch (error) {
      throw new Error(error)
    }
  },

}

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
})
