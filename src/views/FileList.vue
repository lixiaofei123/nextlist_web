<template>
  <div>
    <div>
      <div slot="header" class="clearfix">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item v-for="(item, index) in navs" v-bind:key="item.id"
            ><a v-if="index !== navs.length - 1" @click="godir(item)">{{
              item.name
            }}</a
            ><span v-else>{{ item.name }}</span></el-breadcrumb-item
          >
        </el-breadcrumb>
        <div class="newbtn">
          <el-button
            :type="masonryMode ? 'primary' : ''"
            size="small"
            @click="activeMode('masonry')"
            :circle="smallScreenMode"
            icon="el-icon-picture"
            v-if="imageList.length !== 0"
            ><span v-if="!smallScreenMode">看图模式</span></el-button
          >
          <el-button
            :type="musicMode ? 'primary' : ''"
            size="small"
            @click="activeMode('music')"
            :circle="smallScreenMode"
            icon="el-icon-headset"
            v-if="musicList.length !== 0"
            ><span v-if="!smallScreenMode">音乐模式</span></el-button
          >
          <el-button
            :type="videoMode ? 'primary' : ''"
            size="small"
            @click="activeMode('video')"
            :circle="smallScreenMode"
            icon="el-icon-video-camera"
            v-if="videoList.length !== 0"
            ><span v-if="!smallScreenMode">看剧模式</span></el-button
          >

          <el-button
            type="primary"
            size="small"
            icon="el-icon-search"
            circle
            @click="search"
            v-if="normalPCMode"
          ></el-button
          >&nbsp;&nbsp;
          <el-dropdown v-if="userinfo.userName && normalPCMode">
            <el-button type="primary" size="small">
              添加<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item icon="el-icon-folder"
                ><a @click="newDict">新建文件夹</a></el-dropdown-item
              >
              <el-dropdown-item icon="el-icon-upload"
                ><a @click="uploadFile">上传文件</a></el-dropdown-item
              >
              <el-dropdown-item icon="el-icon-refresh"
                ><a @click="syncDir()">数据同步</a></el-dropdown-item
              >
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
      <div style="height: 15px" />
      <div class="counter" v-if="!smallScreenMode">
        <el-button size="small">全部({{ count.total }})</el-button>
        <el-button size="small">图片({{ count.image }})</el-button>
        <el-button size="small">音乐({{ count.music }})</el-button>
        <el-button size="small">视频({{ count.video }})</el-button>
        <el-button size="small">电子书({{ count.book }})</el-button>
        <el-button size="small">压缩包({{ count.tar }})</el-button>
        <el-button size="small"
          >总大小({{ wellSize(count.totalSize) }})</el-button
        >
      </div>

      <div v-if="!masonryMode && !musicMode && !videoMode">
        <div style="height: 25px" @click="clickSelectCheckbox">
          <el-checkbox
            :indeterminate="
              selectItems.length > 0 && selectItems.length !== files.length
            "
            :value="selectItems.length === files.length && files.length != 0"
          >
            <span v-if="selectItems.length === 0"
              >一共有{{ files.length }}项</span
            >
            <span v-else>选择了{{ selectItems.length }}项</span>
          </el-checkbox>
        </div>

        <el-table
          class="filearea"
          :data="files"
          v-loading="loaddingData"
          @row-click="rowClick"
          @cell-mouse-enter="cellMouseEnter"
          @cell-mouse-leave="cellMouseLeave"
        >
          <el-table-column width="30" column-key="selectbox">
            <template slot-scope="scope">
              <el-checkbox
                style="width: 10px"
                v-model="scope.row.selected"
                v-if="scope.row.selected || scope.row.showChecked"
                :label="scope.row.id"
              ></el-checkbox>
            </template>
          </el-table-column>

          <el-table-column label="名称" column-key="name">
            <template slot-scope="scope">
              <i v-bind:class="fileIcon(scope.row)"></i>
              <span style="margin-left: 10px">
                <a
                  v-if="!scope.row.isDict && scope.row.fileStatus === 1"
                  href="javascript:void(0)"
                  @click="openFile(scope.row)"
                  >{{ scope.row.name }}</a
                >
                <span v-else>{{ scope.row.name }}</span>
              </span>
              <HelpTips
                v-if="scope.row.permission === 2 && scope.row.isDict"
                icon="el-icon-lock"
                tips="这个文件夹只允许上传者访问"
              />
              <HelpTips
                v-if="scope.row.permission === 1 && scope.row.isDict"
                icon="el-icon-user-solid"
                tips="这个文件夹只允许登录用户访问"
              />
              <HelpTips
                v-if="scope.row.permission === 3 && scope.row.isDict"
                icon="el-icon-key"
                tips="这个文件夹已被密码保护"
              />

              <HelpTips
                v-if="!scope.row.isDict && !scope.row.fileStatus"
                icon="el-icon-warning"
                tips="此文件已损坏或者当前正在上传中"
              />
            </template>
          </el-table-column>
          <el-table-column
            prop="userName"
            label="上传者"
            width="80"
            v-if="!smallScreenMode"
          >
          </el-table-column>
          <el-table-column
            prop="createAt"
            label="时间"
            width="180"
            v-if="!smallScreenMode"
          >
          </el-table-column>
          <el-table-column label="大小" width="100" v-if="!smallScreenMode">
            <template slot-scope="scope">
              <span v-if="!scope.row.isDict">{{ scope.row.wellSize }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-if="masonryMode">
        <div style="height: 30px"></div>
        <vue-masonry-wall :items="imageList" :options="masonryOptions">
          <template v-slot:default="{ item }">
            <div class="item">
              <a href="javascript:void(0)" @click="goPreview(item)">
                <div class="block">
                  <el-image
                    style="width: 100%"
                    :src="item.downloadUrls[0].downloadUrl"
                    lazy
                  >
                    <div slot="placeholder" class="image-slot">
                      <i class="el-icon-picture-outline"></i>
                    </div>
                  </el-image>
                </div>
              </a>
            </div>
          </template>
        </vue-masonry-wall>
      </div>
      <div>
        <MusicBox v-if="musicMode" :path="curPath"></MusicBox>
        <VideoBox v-if="videoMode" :path="curPath"></VideoBox>
      </div>

      <div
        style="margin-top: 30px; height: 30px"
        v-if="total > pageCount && !musicMode && !videoMode"
      >
        <el-pagination
          style="float: right"
          background
          layout="prev, pager, next"
          :page-size="pageCount"
          :small="smallScreenMode"
          :total="total"
          :current-page.sync="page"
          @current-change="goto()"
        >
        </el-pagination>
      </div>
    </div>
    <el-dialog title="创建文件夹" :visible.sync="showMkdirDialog" width="30%">
      <el-form
        label-width="80px"
        label-position="left"
        :rules="rules"
        ref="newdirForm"
        :model="newfile"
      >
        <el-form-item label="名称" prop="name">
          <el-input autocomplete="off" v-model="newfile.name"></el-input>
        </el-form-item>
        <el-form-item
          label="访问密码"
          prop="password"
          v-if="newfile.permission === 3"
        >
          <el-input autocomplete="off" v-model="newfile.password"></el-input>
        </el-form-item>

        <el-form-item label="目录权限">
          <el-radio-group v-model="newfile.permission">
            <el-radio :label="0">公开</el-radio>
            <el-radio :label="1">需登录</el-radio>
            <el-radio :label="2">私有</el-radio>
            <el-radio :label="3">设置密码</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showMkdirDialog = false">取 消</el-button>
        <el-button type="primary" @click="mkDir">确 定</el-button>
      </span>
    </el-dialog>
    <div class="uploadProgressBox" v-if="showUploadProgressBox">
      上传文件
      <el-progress
        v-if="upload.status !== ''"
        :percentage="upload.percentage"
        :status="upload.status"
      ></el-progress>
      <el-progress
        v-if="upload.status === ''"
        :percentage="upload.percentage"
      ></el-progress>
      <div style="height: 6px"></div>
      <span class="uploadTips">
        当前上传的是【{{ upload.fileName }}】，上传速度为{{
          upload.uploadSpeed
        }}</span
      >
      <span class="uploadTips"
        >一共<span style="font-size: 14px">{{ upload.uploadTotalNum }}</span
        >个文件，当前上传第
        <span style="color: green; font-size: 14px">{{ upload.uploadNum }}</span
        >个，失败
        <span style="color: red; font-size: 14px">{{
          upload.uploadErrorNum
        }}</span
        >个</span
      >
    </div>

    <div
      v-if="normalMode"
      class="contectMenu"
      v-bind:style="{ bottom: (beSelected ? 50 : -50) + 'px' }"
    >
      <ul>
        <li class="menu" @click="deleteFiles">删除</li>
        <li
          class="menu"
          @click="goPreview"
          v-if="selectItems.length > 0 && !selectItems[0].isDict"
        >
          预览
        </li>
        <!-- <li
          class="menu"
          @click="downloadFile()"
          v-if="selectItems.length > 0 && !selectItems[0].isDict"
        >
          下载
        </li> -->
        <li
          class="menu"
          @click="openDir(selectItems[0])"
          v-if="selectItems.length > 0 && selectItems[0].isDict"
        >
          打开
        </li>
        <li
          class="menu"
          @click="syncDir(selectItems[0])"
          v-if="selectItems.length > 0 && selectItems[0].isDict"
        >
          同步数据
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import {
  mkDir,
  searchFile,
  SignUploadUrl,
  SignDeleteUrl,
  preMkFile,
  uploadFile,
  delFile,
  deleteFileFromDriver,
  confirmFile,
  listDirByPath,
  countFile,
  syncFile
} from "../api/api";
import util from "../common/util";

import HelpTips from "../components/HelpTips.vue";
import MusicBox from "../components/MusicBox.vue";
import VideoBox from "../components/VideoBox.vue";
var moment = require("moment"); // require
import { mapGetters } from "vuex";
var cookies = require("vue-cookie");
import VueMasonryWall from "vue-masonry-wall";
import { Loading } from "element-ui";

export default {
  name: "App",
  components: {
    HelpTips,
    VueMasonryWall,
    MusicBox,
    VideoBox,
  },
  mixins: [util],
  data() {
    return {
      files: [],
      curfid: "",
      curPath: "",
      showMkdirDialog: false,
      showUploadProgressBox: false,
      loaddingData: false,
      smallScreenMode: false,
      screenWidth: 1920,
      page: 1,
      pageCount: 30,
      total: 0,
      keyword: "",
      masonryMode: false,
      musicMode: false,
      videoMode: false,
      masonryOptions: {
        width: 300,
        padding: {
          default: 12,
        },
      },
      count: {
        total: 0,
        image: 0,
        music: 0,
        video: 0,
        book: 0,
        tar: 0,
      },
      upload: {
        status: "",
        percentage: 0,
        uploadTotalNum: 0,
        uploadNum: 0,
        uploadErrorNum: 0,
        fileName: "",
        uploadSpeed: "0k/s",
        TotalSize: 0,
      },
      newfile: {
        name: "",
        permission: 0,
      },
      rules: {
        name: [
          { required: true, message: "文件夹名称", trigger: "blur" },
          {
            min: 1,
            max: 20,
            message: "长度在 1 到 20 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  mounted() {
    window.onresize = () => {
      return (() => {
        window.screenWidth = window.innerWidth;
        this.screenWidth = window.screenWidth;
      })();
    };

    window.screenWidth = window.innerWidth;
    this.screenWidth = window.screenWidth;

    let href = window.location.href;
    if (href.indexOf("#") === -1) {
      this.listDir("");
    } else {
      this.listDir(decodeURIComponent(href.substr(href.indexOf("#") + 1)));
    }

    this.countFile();
  },
  methods: {
    fileIcon(item) {
      let fileType = this.fileType(item);
      if (fileType === "directory") {
        return "el-icon-folder";
      }
      if (fileType === "video") {
        return "el-icon-film";
      }
      if (fileType === "image") {
        return "el-icon-picture";
      }

      if (fileType === "audio") {
        return "el-icon-headset";
      }

      if (fileType === "document") {
        return "el-icon-document";
      }

      if (fileType === "tar") {
        return "el-icon-s-cooperation";
      }

      return "el-icon-tickets";
    },
    restoreNormalMode() {
      this.masonryMode = false;
      this.musicMode = false;
      this.videoMode = false;
    },
    activeMode(mode) {
      if (mode === "masonry") {
        if (!this.masonryMode) {
          this.restoreNormalMode();
        }
        this.masonryMode = !this.masonryMode;
      }

      if (mode === "music") {
        if (!this.musicMode) {
          this.restoreNormalMode();
        }
        this.musicMode = !this.musicMode;
      }

      if (mode === "video") {
        if (!this.videoMode) {
          this.restoreNormalMode();
        }
        this.videoMode = !this.videoMode;
      }
    },
    searchFile(page) {
      this.page = page;
      this.loaddingData = true;
      this.restoreNormalMode();
      searchFile(
        this.keyword,
        this.page,
        this.pageCount,
        (data) => {
          if (data.code === 200) {
            let items = data.data.list;
            this.total = data.data.total;
            for (let item of items) {
              item.createAt = moment(
                item.createAt,
                "YYYY-MM-DDTHH:mm:ss.SSSZ"
              ).format("YYYY-MM-DD");
              item.isDict = item.isDict.Bool;
            }
            this.files = items;
            // 导航处理
            this.curPath = "/搜索结果";
          }
          this.loaddingData = false;
        },
        (errResp) => {
          this.loaddingData = false;
          this.$notify.error({
            title: "错误",
            message: `搜索数据失败,原因是${errResp.data.data}`,
          });
        }
      );
    },
    search() {
      this.$prompt("请输入搜索关键词", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
      }).then(({ value }) => {
        this.keyword = value;
        if (this.keyword !== "") {
          this.searchFile(0);
        }
      });
    },
    countFile() {
      countFile((data) => {
        if (data.code === 200) {
          let items = data.data;
          let total = 0;
          let image = 0;
          let music = 0;
          let video = 0;
          let book = 0;
          let tar = 0;
          let totalSize = 0;
          for (let key in items) {
            let count = items[key];
            if (key === "totalSize") {
              totalSize = count;
              continue;
            }
            total += count;
            if (key.indexOf("image") === 0) {
              image += count;
            }
            if (key.indexOf("audio") === 0) {
              music += count;
            }
            if (key.indexOf("video") === 0) {
              video += count;
            }
            if (key.indexOf("pdf") != -1) {
              book += count;
            }
            if (key.indexOf("zip") != -1 || key.indexOf("compress") != -1) {
              tar += count;
            }
          }

          this.count = {
            total: total,
            image: image,
            music: music,
            video: video,
            book: book,
            tar: tar,
            totalSize: totalSize,
          };
        }
      });
    },
    openFile(item) {
      // let route = this.$router.resolve(`/preview#${item.id}`);
      // window.open(route.href, "_blank");
      this.goPreview(item);
    },
    // downloadFile(item) {

    // },
    goPreview(item) {
      if (!item.downloadUrls) {
        item = this.selectItems[0];
      }
      let route = this.$router.resolve(`/preview#${item.id}`);
      window.open(route.href, "_blank");
    },
    deleteFiles() {
      this.$confirm("此操作将永久删除选中文件, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        for (let item of this.selectItems) {
          this.deleteFile0(
            item,
            (data) => {
              if (data.code === 200) {
                let index = this.files.findIndex((f) => f.id === data.data.id);
                if (index !== -1) {
                  this.files.splice(index, 1);
                }

                this.countFile();

                // 删除成功
                this.$message({
                  type: "success",
                  message: `删除${data.data.name}成功!`,
                });
              }
            },
            (errResp) => {
              this.$notify.error({
                title: "错误",
                message: `删除${item.name}失败,原因是${errResp.data.data}`,
              });
            }
          );
        }
      });
    },
    deleteFile0(item, successCallback, errorCallback) {
      successCallback = successCallback || function () {};
      errorCallback = errorCallback || function () {};
      if (!item.isDict) {
        SignDeleteUrl(
          item.absolutePath,
          (data) => {
            if (data.code === 200) {
              let deleteUrl = data.data;
              delFile(
                item.id,
                (data) => {
                  if (data.code === 200) {
                    deleteFileFromDriver(
                      deleteUrl,
                      () => {
                        successCallback(data);
                      },
                      () => {
                        errorCallback({
                          data: {
                            data: "删除原始文件失败",
                          },
                        });
                      }
                    );
                  }
                },
                (error) => {
                  errorCallback(error);
                }
              );
            }
          },
          (err) => {
            errorCallback(err);
          }
        );
      } else {
        delFile(
          item.id,
          (data) => {
            if (data.code === 200) {
              successCallback(data);
            }
          },
          (error) => {
            errorCallback(error);
          }
        );
      }
    },
    uploadFile0(that, file, successCallback, errorCallback) {
      successCallback = successCallback || function () {};
      errorCallback = errorCallback || function () {};

      that.showUploadProgressBox = true;
      that.upload.percentage = 0;
      that.upload.status = "";
      that.upload.fileName = file.name;
      that.upload.uploadSpeed = "0KB";

      let fileSize = file.size;
      preMkFile(
        that.curfid,
        file.name,
        file.size,
        file.type,
        0,
        (data) => {
          if (data.code === 200) {
            // 请求预授权url
            let key = file.name;
            if (this.curPath !== "") {
              key = that.curPath + "/" + file.name;
            }
            let fileid = data.data.id;
            let ufile = data.data;
            SignUploadUrl(
              key,
              (data) => {
                if (data.code === 200) {
                  // 开始上传 GO
                  let startTime = new Date().getTime();
                  uploadFile(
                    data.data,
                    file,
                    (progress) => {
                      that.upload.percentage = progress;
                      // 计算上传速度
                      that.upload.uploadSpeed =
                        that.wellSize(
                          ((fileSize / 100) * progress) /
                            ((new Date().getTime() - startTime) / 1000)
                        ) + "/秒";
                    },
                    () => {
                      confirmFile(
                        fileid,
                        (data) => {
                          if (data.code === 200) {
                            that.upload.status = "success";
                            that.listDir(that.curPath);
                            that.countFile();
                          }
                          setTimeout(() => {
                            that.showUploadProgressBox = false;
                            successCallback();
                          }, 3000);
                        },
                        () => {
                          that.upload.status = "exception";
                          setTimeout(() => {
                            that.showUploadProgressBox = false;
                            errorCallback();
                          }, 3000);
                        }
                      );
                    },
                    () => {
                      that.$notify.error({
                        title: "错误",
                        message: `上传失败`,
                      });

                      //失败以后删除文件
                      that.deleteFile0(ufile);
                      that.upload.status = "exception";
                      setTimeout(() => {
                        that.showUploadProgressBox = false;
                        errorCallback();
                      }, 3000);
                    }
                  );
                }
              },
              (errResp) => {
                that.$notify.error({
                  title: "错误",
                  message: `获取预授权url失败,原因是${errResp.data.data}`,
                });
                errorCallback();
              }
            );
          }
        },
        (errResp) => {
          that.$notify.error({
            title: "错误",
            message: `创建文件失败,原因是${errResp.data.data}`,
          });
          errorCallback();
        }
      );
    },
    uploadFiles(that, files, retry) {
      if (retry < 3) {
        that.upload.uploadTotalNum = files.length;
        that.upload.uploadNum = 0;
        that.upload.uploadErrorNum = 0;
        let uploadErrFiles = [];
        let uploadNextFile = () => {
          let file = files.pop();
          that.upload.uploadNum++;
          if (file) {
            that.uploadFile0(that, file, uploadNextFile, () => {
              that.upload.uploadErrorNum++;
              uploadErrFiles.push(file);
              uploadNextFile();
            });
          } else {
            if (that.upload.uploadErrorNum > 0) {
              //对于上传失败的数据，进行重试....
              that.uploadFiles(that, uploadErrFiles, ++retry);
            } else {
              that.showUploadProgressBox = false;
            }
          }
        };
        uploadNextFile();
      } else {
        this.$notify.error({
          title: "错误",
          message: `重试3次以后仍有未上传成功的文件!!!!`,
        });
      }
    },
    uploadFile() {
      let that = this;
      let fileInput = document.createElement("input");
      fileInput.setAttribute("type", "file");
      fileInput.setAttribute("style", "visibility:hidden");
      fileInput.setAttribute("multiple", "multiple");
      fileInput.addEventListener("change", function () {
        if (this.files.length > 0) {
          let files = [];
          for (let i = 0; i < this.files.length; i++) {
            files.push(this.files[i]);
          }
          that.uploadFiles(that, files, 0);
        }
      });
      fileInput.click();
    },
    listDir(path, password, page, successCallback) {
      window.location = `#${path}`;
      document.title = path;
      this.loaddingData = true;
      successCallback = successCallback || function () {};
      this.curPath = path;

      if (password) {
        // 存起来
        let key = encodeURIComponent(`password_${path}`);
        cookies.set(key, password, { expires: 7 });
      } else {
        //从cookies里查询是否有匹配的密码
        password = this.findDirPassword(path);
      }

      if (!page) {
        page = 1;
      }

      this.page = page;

      listDirByPath(
        path,
        password,
        page,
        this.pageCount,
        (data) => {
          if (data.code === 200) {
            let items = data.data.list;
            this.total = data.data.total;
            this.curfid = data.data.extend.fileid || "";
            this.files = [];
            for (let item of items) {
              item.timestamp =
                moment(item.createAt, "YYYY-MM-DDTHH:mm:ss.SSSZ").unix() * 1000;
              item.createAt = moment(item.timestamp).format("YYYY-MM-DD");
              item.isDict = item.isDict.Bool;
              if (item.downloadUrls) {
                for (let i = 0; i < item.downloadUrls.length; i++) {
                  item.downloadUrls[i].downloadUrl = this.encodeURI(
                    item.downloadUrls[i].downloadUrl
                  );
                }
              }
              item.wellSize = this.wellSize(item.fileSize);
            }
            items.sort((a, b) => {
              if (a.isDict != b.isDict) {
                return (a.isDict ? 0 : 1) - (b.isDict ? 0 : 1);
              } else {
                return b.timestamp - a.timestamp;
              }
            });
            this.files = items;
          }
          this.loaddingData = false;
          successCallback();
        },
        (errResp) => {
          this.loaddingData = false;
          this.files = [];
          if (errResp.data.data === "密码错误") {
            this.$prompt("请输入正确的访问密码", "提示", {
              confirmButtonText: "确定",
              cancelButtonText: "取消",
            }).then(({ value }) => {
              this.listDir(path, value);
            });
          } else {
            this.$notify.error({
              title: "错误",
              message: `加载目录失败,原因是${errResp.data.data}`,
            });
          }
        }
      );
    },
    newDict() {
      this.showMkdirDialog = true;
    },
    mkDir() {
      this.$refs["newdirForm"].validate((valid) => {
        let name = this.newfile.name;
        let permission = this.newfile.permission;
        let password = this.newfile.password;
        if (valid) {
          mkDir(
            this.curfid,
            name,
            permission,
            password,
            (data) => {
              if (data.code === 200) {
                // 创建成功
                this.listDir(this.curPath);
              }
              this.showMkdirDialog = false;
            },
            (errResp) => {
              this.$notify.error({
                title: "错误",
                message: `创建目录${name}失败,原因是${errResp.data.data}`,
              });
            }
          );
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    rowClick(row, column) {
      if (
        row.isDict &&
        (column.columnKey !== "selectbox" || this.smallScreenMode)
      ) {
        this.openDir(row);
      }
    },
    syncDir(item) {
      if (!item) {
        item = {
          absolutePath: this.curPath || "/",
        };
      }

      let path = item.absolutePath;

      this.$confirm(`此操作将会扫描你选择的存储驱动并将【${path}】目录下的文件信息同步到列表程序, 是否继续?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        let loadingInstance = Loading.service({
          fullscreen: true,
          text: `请稍后，正在同步【${path}】目录的数据，请不要关闭页面....`,
        });
        syncFile(
          path,
          () => {
            loadingInstance.close();
            this.$message({
              type: "success",
              message: `【${path}】目录的数据同步成功!`,
            });
            this.listDir(path)
          },
          (errResp) => {
            loadingInstance.close();
            this.$notify.error({
              title: "错误",
              message: `【${path}】目录的数据同步失败,原因是${errResp.data.data}`,
            });
          }
        );
      });
    },
    openDir(item) {
      if (item.permission === 3) {
        let path = item.absolutePath;
        let password = this.findDirPassword(path);
        if (!password) {
          //需要输入密码访问
          this.$prompt("请输入文件夹密码", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
          }).then(({ value }) => {
            this.listDir(item.absolutePath, value, 0, () => {
              this.curfid = item.id;
            });
          });
        } else {
          this.listDir(item.absolutePath, password, 0, () => {
            this.curfid = item.id;
          });
        }
      } else {
        this.listDir(item.absolutePath, "", 0, () => {
          this.curfid = item.id;
        });
      }
    },
    cellMouseEnter(row) {
      let index = this.files.findIndex((f) => f.id === row.id);
      if (index !== -1) {
        this.files[index].showChecked = true;
        this.$set(this.files, index, this.files[index]);
      }
    },
    cellMouseLeave(row) {
      let index = this.files.findIndex((f) => f.id === row.id);
      if (index !== -1) {
        this.files[index].showChecked = false;
        this.$set(this.files, index, this.files[index]);
      }
    },
    godir(item) {
      this.listDir(item.path);
    },
    goto() {
      if (this.curPath === "/搜索结果") {
        this.searchFile(this.page);
      } else {
        this.listDir(this.curPath, "", this.page);
      }
    },
    clickSelectCheckbox(event) {
      event.preventDefault();
      if (this.selectItems.length === this.files.length) {
        // 全部取消
        for (let i = 0; i < this.files.length; i++) {
          this.files[i].selected = false;
          this.$set(this.files, i, this.files[i]);
        }
      } else {
        // 全部选中
        for (let i = 0; i < this.files.length; i++) {
          this.files[i].selected = true;
          this.$set(this.files, i, this.files[i]);
        }
      }
    },
  },
  computed: {
    ...mapGetters(["userinfo"]),
    selectItems() {
      let selected = [];
      for (let item of this.files) {
        if (item.selected) {
          selected.push(item);
        }
      }
      return selected;
    },
    beSelected() {
      return this.selectItems.length > 0;
    },
    normalPCMode() {
      return (
        !this.videoMode &&
        !this.musicMode &&
        !this.masonryMode &&
        !this.smallScreenMode
      );
    },
    normalMode() {
      return !this.videoMode && !this.musicMode && !this.masonryMode;
    },
    navs() {
      let paths = [];
      let splits = this.curPath.split("/");
      for (let i = 0; i < splits.length; i++) {
        if (i == 0) {
          paths.push({
            name: "主目录",
            path: "",
          });
        } else {
          paths.push({
            name: splits[i],
            path: paths[i - 1].path + "/" + splits[i],
          });
        }
      }
      return paths;
    },
    imageList() {
      let images = [];
      for (let file of this.files) {
        if (this.fileType(file) === "image") {
          images.push(file);
        }
      }
      return images;
    },
    musicList() {
      let musics = [];
      for (let file of this.files) {
        if (this.fileType(file) === "audio") {
          musics.push(file);
        }
      }
      return musics;
    },
    videoList() {
      let videos = [];
      for (let file of this.files) {
        if (this.fileType(file) === "video") {
          videos.push(file);
        }
      }
      return videos;
    },
  },
  watch: {
    showMkdirDialog(newVal) {
      if (!newVal) {
        this.newfile = {
          name: "",
          permission: 0,
        };
        this.$refs["newdirForm"].resetFields();
      }
    },
    screenWidth(val) {
      if (val < 768) {
        this.smallScreenMode = true;
      } else {
        this.smallScreenMode = false;
      }
    },
    $route(to, from) {
      if (to !== from) {
        this.restoreNormalMode();

        if (to.path === "/" && to.hash === "") {
          this.listDir("");
        }
      }
    },
  },
};
</script>

<style scoped>
.filearea {
  width: 100%;
}

.newbtn {
  top: 15px;
  right: 20px;
  position: absolute;
}
.uploadProgressBox {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 330px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  position: fixed;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  padding: 14px 26px 14px 13px;
  transition: opacity 0.3s, transform 0.3s, left 0.3s, right 0.3s, top 0.4s,
    bottom 0.3s;
}

a {
  text-decoration: none;
  color: #363636;
}

.contectMenu {
  align-items: center;
  padding: 2px 16px;
  border-radius: 10px;
  background: rgb(36, 36, 36);
  width: 200px;
  position: fixed;
  left: calc(50% - 116px);
  transition: bottom 0.8s;
  z-index: 999;
}

.contectMenu .menu {
  color: rgb(226, 226, 226);
  display: inline-block;
  padding: 12px 12px;
  font-size: 12px;
  cursor: pointer;
}

.contectMenu .menu:hover {
  color: white;
}

.contectMenu ul,
.contectMenu li {
  padding: 0px;
  margin: 0px;
  list-style: none;
}

.uploadTips {
  display: inline-block;
  font-size: 12px;
  line-height: 20px;
}

.counter {
  margin-bottom: 20px;
}

.counter .item {
  margin-right: 25px;
}

.image-slot {
  width: 100%;
  text-align: center;
  padding: 50px 0px;
  font-size: 30px;
  background: #f5f7fa;
  color: #909399;
}
</style>

<style>
.masonry-wall {
  align-content: center;
}
</style>
