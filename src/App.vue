<template>
  <div id="app">
    <el-container>
      <el-header style="padding: 0px">
        <div class="textlogo" @click="goHome" v-if="title">
          {{ title }}
        </div>
        <div class="logo" @click="goHome" v-else>
          <img height="35" src="/logo.png" />
        </div>
        <el-menu mode="horizontal" @select="handleSelect">
          <el-menu-item
            index="login"
            style="float: right; margin-right: 20px"
            v-if="!userinfo.userName"
            >登录</el-menu-item
          >
          <el-menu-item
            index="register"
            style="float: right; margin-right: 20px"
            v-if="!userinfo.userName && allowRegister"
            >注册</el-menu-item
          >
          <el-submenu index="2" style="float: right" v-if="userinfo.userName">
            <template slot="title">{{ userinfo.userName }}</template>
            <el-menu-item index="logout">注销</el-menu-item>
          </el-submenu>
        </el-menu>
      </el-header>
      <el-main>
        <el-card class="container">
          <router-view />
        </el-card>
      </el-main>
      <el-footer>
        <span class="footer" v-html="copyright"></span>
      </el-footer>
    </el-container>
    <Login
      v-if="showLoginBox"
      @loginSuccess="loginSuccess"
      @loginCancel="showLoginBox = false"
    />

    <Register
      v-if="showRegisterBox"
      @registerSuccess="registerSuccess"
      @registerCancel="showRegisterBox = false"
    />
  </div>
</template>

<script>
import { myinfo, siteConfig } from "./api/api";
import { mapActions } from "vuex";
import { mapGetters } from "vuex";

import Login from "./components/Login.vue";
import Register from "./components/Register.vue";

export default {
  name: "App",
  components: {
    Login,
    Register,
  },
  data() {
    return {
      showLoginBox: false,
      showRegisterBox: false,
      allowRegister: false,
      title: "",
      copyright: "本站的资料仅供学习使用，请在下载后24小时内删除",
    };
  },
  mounted() {
    this.loadSiteConfig();
    this.loadUserInfo();
  },
  methods: {
    ...mapActions(["setUserinfo", "resetUserinfo"]),
    handleSelect(key) {
      if (key === "login") {
        this.showRegisterBox = false;
        this.showLoginBox = true;
      } else if (key === "logout") {
        // 清除cookies
        this.$cookie.delete("authorization");
        this.resetUserinfo();
      } else if (key === "register") {
        this.showLoginBox = false;
        this.showRegisterBox = true;
      }
    },
    loadUserInfo() {
      myinfo((data) => {
        if (data.code === 200) {
          this.setUserinfo(data.data);
        }
      });
    },
    loadSiteConfig() {
      siteConfig((data) => {
        if (data.code === 200) {
          let config = data.data;
          this.title = config.title;
          this.copyright = config.copyright;
          this.allowRegister = config.allowRegister;
        }
      });
    },
    loginSuccess() {
      this.showLoginBox = false;
      this.loadUserInfo();
    },
    registerSuccess() {
      this.$message({
        type: "success",
        message: `账号注册成功，请登录`,
      });
      this.showRegisterBox = false;
      this.loadSiteConfig();
    },
    goHome() {
      this.$router.push("/");
    },
  },
  computed: {
    ...mapGetters(["userinfo"]),
  },
  watch: {},
};
</script>

<style scoped>
#app {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.container {
  max-width: 1080px;
  background: white;
  margin: 20px auto;
  position: relative;
}

a {
  text-decoration: none;
  color: #363636;
}

ul,
li {
  padding: 0px;
  margin: 0px;
  list-style: none;
}

.el-container {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.el-main {
  height: 100%;
  overflow: hidden;
}
.el-footer {
  display: flex;
  height: 4vh;
  width: 100%;
  align-items: center;
}

.footer {
  font-size: 12px;
}

.textlogo {
  z-index: 10;
  position: absolute;
  left: 20px;
  cursor: pointer;
  font-size: 25px;
  font-weight: 600;
  line-height: 60px;
  color: #66b1ff;
}

.logo {
  z-index: 10;
  position: absolute;
  left: 20px;
  padding-top: 12px;
  cursor: pointer;
}
</style>
