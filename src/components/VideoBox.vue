<template>
  <div class="videobox">
    <div>
      <video v-if="!loading" style="width:100%" :src="videoUrl" autoplay controls @error="playNext" @ended="playNext">
      </video>
    </div>
    <div class="list">
      <div v-if="loading">正在加载视频列表中，请稍后...</div>
      <el-tabs v-model="activeTab" v-if="!loading">
        <el-tab-pane
          v-for="index in totalTabNums"
          :label="labelName(index)"
          :name="labelName(index)"
          v-bind:key="index"
        >
          <el-tag
            class="videobutton"
            v-for="item in videoList.slice(
              (index - 1) * tabCount,
              index * tabCount
            )"
            :key="item.name"
            @click="playVideo(item)"
            :effect="item.play ? 'dark' : 'plain'"
          >
            {{ item.name }}
          </el-tag>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import { listDirByPath } from "../api/api";

import util from "../common/util";

export default {
  name: "VideoBox",
  props: {
    path: String,
  },
  mixins: [util],
  data() {
    return {
      videoList: [],
      page: 1,
      pageCount: 50,
      total: 0,
      activeTab: "",
      tabCount: 50,
      videoUrl: "",
      showVideo: true,
      playNextTimer: null,
      loading: true,
    };
  },
  mounted() {
    this.loadAllVideos();
  },
  destroyed() {
    this.videoUrl = false;
    this.showVideo = false;
  },
  methods: {
    async loadAllVideos() {
      this.videoList = [];
      try {
        let videos = await this.listDir(this.path, 1);
        this.videoList = this.videoList.concat(videos);
        if (this.total > this.pageCount) {
          let totalPage = Math.ceil(this.total / this.pageCount);
          for (let i = 2; i <= totalPage; i++) {
            videos = await this.listDir(this.path, i);
            this.videoList = this.videoList.concat(videos);
          }
        }

        this.videoList.sort((a, b) => {
          // 先尝试用正则表达式提取出标题中的数字
          let anums = [...a.name.matchAll(/(\d+)/g)];
          let bnums = [...b.name.matchAll(/(\d+)/g)];

          for (let i = 0; i < anums.length; i++) {
            if (bnums.length > i) {
              if (anums[i][0] != bnums[i][0]) {
                return anums[i][0] - bnums[i][0];
              }
            }
          }
          return 0;
        });

       this.activeTab = this.labelName(1)

        this.loading = false;

        this.playVideo(this.videoList[0], 0);

      } catch (error) {
        this.$notify.error({
          title: "错误",
          message: `加载视频列表失败,原因是${error}`,
        });
      }
    },
    listDir(path, page) {
      return new Promise((resolve, reject) => {
        let password = this.findDirPassword(path);
        listDirByPath(
          path,
          password,
          page,
          this.pageCount,
          (data) => {
            if (data.code === 200) {
              let items = data.data.list;
              this.total = data.data.total;
              let videoList = [];
              for (let item of items) {
                item.isDict = item.isDict.Bool;
                let fileType = this.fileType(item);
                if (fileType === "video") {
                  item.play = false;
                  item.downloadUrl = this.encodeURI(item.downloadUrls[0].downloadUrl);
                  item.name = item.name.substr(0, item.name.lastIndexOf("."));
                  videoList.push(item);
                }
              }
              resolve(videoList);
            }
          },
          (errResp) => {
            reject(errResp.data.data);
          }
        );
      });
    },
    labelName(i) {
      let min = (i - 1) * this.tabCount + 1;
      let max = i * this.tabCount;
      if (max > this.videoList.length) {
        max = this.videoList.length;
      }

      if (min != max) {
        return `${(i - 1) * this.tabCount + 1}-${max}`;
      } else {
        return `${min}`;
      }
    },
    playVideo(item, index) {
      if (index === undefined) {
        index = this.videoList.findIndex((v) => v.id === item.id);
      }
      if (index != -1) {
        for (let i = 0; i < this.videoList.length; i++) {
          this.videoList[i].play = false;
        }
        this.videoList[index].play = true;
        this.showVideo = false;
        setTimeout(() => {
          this.videoUrl = item.downloadUrl;
          this.showVideo = true;
        }, 10);
      }
    },
    playNext() {
      if (this.playNextTimer == null) {
        this.playNextTimer = setTimeout(() => {
          let index = this.videoList.findIndex((v) => v.play);
          if (index !== this.videoList.length - 1) {
            let tabname = this.activeTab;
            let max = 0;
            if (tabname.indexOf("-") === -1) {
              max = parseInt(tabname);
            } else {
              max = parseInt(tabname.split("-")[1]);
            }
            if (index === max - 1) {
              // 切换到下一个标签页
              this.activeTab = this.labelName((index + 1) / this.tabCount + 1);
            }

            this.playVideo(this.videoList[index + 1], index + 1);
          }
          this.playNextTimer = null;
        }, 1000);
      }
    },
  },
  watch: {},
  computed: {
    totalTabNums() {
      return Math.ceil(this.videoList.length / this.tabCount);
    },
  },
};
</script>

<style scoped>
.video {
  width: 100%;
}
.list {
  margin-top: 20px;
}
.videobutton {
  cursor: pointer;
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
}
</style>
