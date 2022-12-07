<template>
  <div>
    <h3>欢迎来到安装界面</h3>
    <div style="height:30px"></div>
    <div style="padding-left:40px;padding-right:40px">
      <el-steps :active="active" finish-status="success">
        <el-step title="配置数据库"></el-step>
        <el-step title="配置后端存储"></el-step>
        <el-step title="站点配置"></el-step>
      </el-steps>
      <div style="height:50px"></div>
      <div class="step" v-if="active === 0">
        <el-form ref="form" :model="dbconfig" label-width="120px">
          <el-form-item label="数据库地址">
            <el-input v-model="dbconfig.url"></el-input>
          </el-form-item>
          <el-form-item label="端口">
            <el-input v-model.number="dbconfig.port" type="number"></el-input>
          </el-form-item>
          <el-form-item label="数据库">
            <el-input v-model="dbconfig.database"></el-input>
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="dbconfig.username"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="dbconfig.password" type="password"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="checkDbConn">测试数据库连接</el-button>
            <el-button type="primary" @click="active = 1" :disabled="disabledStep1">下一步</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="step" v-if="active === 1">
        <el-form ref="form" :model="driverConfig" label-width="120px">
          <el-form-item label="存储类型">
            <el-select v-model="driverConfig.name" placeholder="请选择存储类型">
              <el-option v-for="item in driverprops" v-bind:key="item.name" :label="item.showname" :value="item.name">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item v-for="item in selectDrivePops" v-bind:key="item.name" :label="item.label">
            <el-input v-model="driverConfig.config[item.name]" v-if="item.type !== 'boolean'" 
            :type="item.type==='int' ? 'number' : ''" ></el-input>
            <el-switch v-else v-model="driverConfig.config[item.name]" active-color="#13ce66" inactive-color="#ff4949">
            </el-switch>
            <br><span class="usage">{{ item.usage }}</span>
          </el-form-item>

          <el-form-item>
            <el-button @click="active = 0">上一步</el-button>
            <el-button @click="checkDriveConn">测试存储</el-button>
            <el-button type="primary" @click="active = 2" :disabled="disabledStep2">下一步</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="step" v-if="active === 2">
        <el-form ref="form" :model="siteConfig" label-width="120px">
          <el-form-item label="站点标题">
            <el-input v-model="siteConfig.title"></el-input>
          </el-form-item>
          <el-form-item label="版权声明">
            <el-input v-model="siteConfig.copyright"></el-input>
          </el-form-item>
          <el-form-item label="开启注册">
            <el-switch v-model="siteConfig.allowRegister"></el-switch><br><br>
            <span class="usage">即使关闭注册功能,仍允许注册第一个用户</span>
          </el-form-item>
          <el-form-item label="登录加密密钥">
            <el-input v-model="authConfig.secret"></el-input>
            <span class="usage">生成加密登录凭证时使用的密钥,请任意填写</span>
          </el-form-item>

          <el-form-item>
            <el-button @click="active = 1">上一步</el-button>
            <el-button type="primary" @click="saveAndReload">保存配置并重启站点</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>

import { checkDB, checkDriver, getDriverprops, installSite, reloadSite, checkSiteIsReady } from "../api/api";


export default {
  name: "Install",
  mixins: [],
  components: {
  },
  data() {
    return {
      active: 0,
      disabledStep1: true,
      disabledStep2: true,
      driverConfig: {
        name: "s3",
        config: {
          host: "",
        },
        download: [

        ],
      },
      driverprops: [],
      dbconfig: {
        url: "",
        port: 3306,
        database: "",
        username: "",
        password: ""
      },
      siteConfig: {
        allowRegister: false,
        title: "NextList",
        copyright: ""
      },
      authConfig: {
        secret: ""
      },
    };
  },
  mounted() {

    checkSiteIsReady(data => {
      if (data.ready) {
        this.$router.push("/")
      } else {
        this.driverConfig.config.host = window.config.apiHost
        getDriverprops(data => {
          if (data.code === 200) {
            Object.entries(data.data).forEach((k) => {
              this.driverprops.push(k[1])
            })
          }
        })
      }
    })


  },
  methods: {
    saveAndReload() {
      let config = {
        database: {
          mysql: this.dbconfig,
        },
        driver: this.driverConfig,
        site: this.siteConfig,
        auth: this.authConfig
      }
      installSite(config, () => {
        reloadSite(() => {
          this.$alert('请刷新页面', '成功', {
            confirmButtonText: '确定',
          });
        }, () => {
          this.$notify.error({
            title: "错误",
            message: `未知错误`,
          });
        })
      }, (errResp) => {
        this.$notify.error({
          title: "错误",
          message: `测试存储连接失败,原因是${errResp.data.data}`,
        });
      })
    },
    checkDriveConn() {
      checkDriver(this.driverConfig, () => {
        this.$notify({
          title: '成功',
          message: '测试存储连接成功',
          type: 'success'
        });
        this.disabledStep2 = false

      }, (errResp) => {
        this.$notify.error({
          title: "错误",
          message: `测试存储连接失败,原因是${errResp.data.data}`,
        });
      })
    },
    checkDbConn() {
      checkDB(this.dbconfig, () => {
        this.$notify({
          title: '成功',
          message: '测试数据库连接成功',
          type: 'success'
        });
        this.disabledStep1 = false

      }, (errResp) => {
        this.$notify.error({
          title: "错误",
          message: `测试数据库连接失败,原因是${errResp.data.data}`,
        });
      })
    }
  },
  computed: {
    selectDrivePops() {
      let props = this.driverprops.find(x => x.name === this.driverConfig.name)
      return props ? props.properties : []
    }
  },
  watch: {
    active(newVal) {
      if (newVal === 0) {
        this.disabledStep1 = true
      }

      if (newVal === 1) {
        this.disabledStep2 = true
      }
    }
  },
};
</script>

<style scoped>
.step {
  padding-left: 100px;
  padding-right: 100px;
}

.usage {
  font-size: 14px;
  color: grey;
}
</style>
<style>
.el-form-item__content {
  line-height: normal;
}
</style>