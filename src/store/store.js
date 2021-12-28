import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        userinfo: {
            userName: ''
        },
    },
    getters: {
        userinfo: state => {
            return state.userinfo
        }
    },
    mutations: {
        setUserinfo(state, userinfo) {
            state.userinfo = userinfo
        },
        resetUserinfo(state) {
            state.userinfo = {
                userName: ''
            }
        }
    },
    actions: {
        setUserinfo(context, userinfo) {
            context.commit('setUserinfo', userinfo)
        },
        resetUserinfo(context) {
            context.commit('resetUserinfo')
        }
    }
})

export default store