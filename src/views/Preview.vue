<template>
  <div>
    <div class="header">
      <div class="title">{{ file.name }}</div>
      <div class="meta">
        文件大小: {{ wellSize(file.fileSize) }} &nbsp;&nbsp; 上传者:
        {{ file.userName }} &nbsp;&nbsp; 上传日期: {{ file.time }} &nbsp;&nbsp;
      </div>
    </div>
    <div class="preview">
      <div v-if="fType === 'video'">
        <video
          class="video"
          style="width: 100%"
          :src="file.downloadUrl"
          autoplay
          controls
        ></video>
      </div>
      <div v-else-if="fType === 'image'">
        <el-image class="image" :src="file.downloadUrl"></el-image>
      </div>
      <div v-else-if="fType === 'audio'">
        <div style="margin-top: 20px"></div>
        <vue-audio :audio-source="file.downloadUrl"></vue-audio>
        <div style="margin-top: 20px"></div>
      </div>
      <div v-else-if="file.fileType.indexOf('pdf') !== -1">
        <el-progress
          class="pdfprogress"
          type="circle"
          :percentage="loadPdfPercent"
          v-if="loadPdfPercent != 100"
        ></el-progress>
        <pdf
          ref="pdf"
          :src="file.downloadUrl"
          @progress="loadpdf"
          @loaded="loadpdfSuccess"
        ></pdf>
      </div>
      <div v-else-if="!text && fType !== '' && file.fileSize < (1024 * 512)" class="notsupport">
        暂不支持此文件格式的预览，是否尝试以文本方式打开?&nbsp;&nbsp;<a
          href="javascript:void(0)"
          class="button"
          @click="openWithText"
          >确定</a
        >
      </div>
      <div v-else-if="!text" class="notsupport">
        暂不支持此文件格式的预览
      </div>
      <div class="textpreview" v-if="text">
        <live-preview :code="text" />
      </div>
    </div>
    <div class="download">
      <span>下载地址</span>
      <div class="downloadBorder"></div>
      <a v-for="item in file.downloadUrls" v-bind:key="item.downloadUrl"
        :href="item.downloadUrl"
        :download="file.name"
        target="_blank"
        class="downloadBtn"
        >{{item.title}}</a
      >
      <div style="clear: both"></div>
    </div>
  </div>
</template>

<script>
import { fileInfo, readFile, basefileInfo } from "../api/api";

import { mapGetters } from "vuex";
import util from "../common/util";
var moment = require("moment");
import pdf from "vue-pdf";
var cookies = require("vue-cookie");

export default {
  name: "Preview",
  mixins: [util],
  components: {
    pdf,
  },
  data() {
    return {
      fType: "",
      loadPdfPercent: 0,
      file: {
        name: "加载中",
        fileSize: 0,
        userName: "",
        time: "",
        fileType: "",
      },
      text: "",
    };
  },
  mounted() {
    document.title = "预览";
    let href = window.location.href;
    if (href.indexOf("#") !== -1) {
      let fid = decodeURIComponent(href.substr(href.indexOf("#") + 1));
      this.fileInfo(fid, "");
    } else {
      this.$notify.error({
        title: "错误",
        message: `404 Not Found`,
      });
    }
  },
  methods: {
    fileInfo(fid, password) {
      basefileInfo(fid, (data) => {
        if (data.code === 200) {
          let path = data.data.absolutePath;
          if (!password) {
            password = this.findDirPassword(path);
          } else {
            let key = encodeURIComponent(`password_${path}`);
            cookies.set(key, password, { expires: 7 });
          }

          fileInfo(
            fid,
            password,
            (data) => {
              if (data.code == 200) {
                this.file = {
                  ...data.data,
                  isDict: data.data.isDict.Bool,
                  downloadUrl: data.data.downloadUrls[0].downloadUrl,
                  time: moment(
                    data.data.createAt,
                    "YYYY-MM-DDTHH:mm:ss.SSSZ"
                  ).format("YYYY年MM月DD日"),
                };
                if (this.file.downloadUrls) {
                  for (let i = 0; i < this.file.downloadUrls.length; i++) {
                    this.file.downloadUrls[i].downloadUrl = this.encodeURI(
                      this.file.downloadUrls[i].downloadUrl
                    );
                  }
                }
                this.fType = this.fileType(this.file);
                document.title = this.file.name;
              }
            },
            (errResp) => {
              if (errResp.data.data === "密码错误") {
                this.$prompt("请输入正确的访问密码", "提示", {
                  confirmButtonText: "确定",
                  cancelButtonText: "取消",
                }).then(({ value }) => {
                  this.fileInfo(fid, value);
                });
              } else {
                this.$notify.error({
                  title: "错误",
                  message: `查看文件信息,原因是${errResp.data.data}`,
                });
              }
            }
          );
        }
      });
    },
    loadError(error) {
      console.log(error);
    },
    loadpdf(progress) {
      this.loadPdfPercent = Math.ceil(progress * 100);
    },
    loadpdfSuccess() {
      this.loadPdfPercent = 100;
    },
    openWithText() {
      readFile(this.file.downloadUrl, (data) => {
        this.text = data;
      });
    },
  },
  computed: {
    ...mapGetters(["userinfo"]),
  },
  watch: {},
};
</script>

<style scoped>
.header {
  padding-top: 5px;
  padding-bottom: 5px;
}
.title {
  font-size: 20px;
}
.meta {
  font-size: 12px;
  color: rgb(95, 95, 95);
  padding-top: 10px;
}
.preview {
  padding-top: 20px;
  text-align: center;
}

.download {
  padding-top: 15px;
  padding-bottom: 10px;
  margin-top: 15px;
}

.downloadBorder{
  clear: both;
  margin-bottom: 10px;
}

.downloadBtn {
  display: block;
  color: #3f7ebd;
  text-decoration: none;
  font-size: 14px;
  margin-right: 15px;
  float: left;
}


.downloadBtn:hover{
  color: #4697e7;
}

.image {
  max-width: 100%;
}
.video {
  width: 100%;
}

.notsupport {
  padding-top: 50px;
  padding-bottom: 50px;
  background: rgb(197, 197, 197);
}
.pdfprogress {
  margin-top: 80px;
}

.button {
  text-decoration: none;
  color: #3f7ebd;
}

.textpreview {
  padding: 0px 20px;
}
</style>
<style>
.CodeMirror {
  height: auto;
}
</style>
