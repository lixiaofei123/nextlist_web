<template>
  <div class="musicbox">
    <div class="musiclist">
      <div style="width: 320px"></div>
      <ul>
        <li
          v-for="(item, index) in musicList"
          :class="{ active: item.play }"
          v-bind:key="item.id"
          @click="playMusic(item)"
        >
          <span class="number"
            ><span v-if="!item.play">{{ index + 1 }}</span>
            <img
              v-if="item.play"
              width="14"
              src="@/assets/images/playing.gif"
            />
          </span>
          <span class="title"> {{ item.name }} </span>
        </li>
      </ul>
      <div style="position: absolute; bottom: 50px" v-if="total > pageCount">
        <el-pagination
          layout="prev, pager, next"
          :total="total"
          :small="true"
          :page-size="pageCount"
          :current-page.sync="page"
          @current-change="goto()"
        >
        </el-pagination>
      </div>
    </div>
    <div class="player" v-if="curMusic">
      <div class="title">
        {{ curMusic.name }}
      </div>
      <div class="changpian">
        <div
          class="needle"
          :style="{ transform: 'rotate(' + (curMusic.play ? 0 : -30) + 'deg)' }"
        >
          <img
            width="74px"
            height="120px"
            src="@/assets/images/needle-ab.png"
          />
        </div>
        <div
          class="pan"
          :style="{ 'animation-name': curMusic.play ? 'rotate' : 'static' }"
        >
          <div class="cover">
            <img width="120" height="120" src="@/assets/logo.png" />
          </div>
          <div class="singlecover">
            <img
              width="180"
              height="180"
              src="@/assets/images/singlecover.png"
            />
          </div>
        </div>
      </div>
      <div class="controller">
        <div class="buttons">
          <button @click="previous"><i class="el-icon-arrow-left"></i></button>
          <button>
            <i
              :class="{
                'el-icon-video-play': !curMusic.play,
                'el-icon-video-pause': curMusic.play,
              }"
              @click="pauseOrPlay"
            ></i>
          </button>
          <button @click="next"><i class="el-icon-arrow-right"></i></button>
          <button>
            <i
              :class="{
                'el-icon-refresh-right': playMode === 1,
                'el-icon-refresh': playMode === 0,
              }"
              @click="playMode = playMode === 0 ? 1 : 0"
            ></i>
          </button>
        </div>
        <div class="progress">
          <el-progress
            class="bar"
            :percentage="(currentTime / duration) * 100"
            :show-text="false"
          ></el-progress>
          <span class="time"
            >{{ formatTime(currentTime) }}/{{ formatTime(duration) }}</span
          >
        </div>
      </div>
    </div>
    <div class="player" v-if="!curMusic">
      <div class="title" style="font-size: 30px; margin-top: 40px">
        听音乐，上【51文件】
      </div>
      <div style="text-align: center; margin-top: 30px">
        <img width="180" src="@/assets/logo.png" />
      </div>
    </div>

    <div class="mobile-controller" v-if="curMusic">
      <div
        class="pan"
        :style="{ 'animation-name': curMusic.play ? 'rotate' : 'static' }"
      >
        <div class="cover">
          <img width="50" height="50" src="@/assets/logo.png" />
        </div>
        <div class="singlecover">
          <img width="80" height="80" src="@/assets/images/singlecover.png" />
        </div>
      </div>
      <div class="controller">
        <div class="buttons">
          <button @click="previous"><i class="el-icon-arrow-left"></i></button>
          <button>
            <i
              :class="{
                'el-icon-video-play': !curMusic.play,
                'el-icon-video-pause': curMusic.play,
              }"
              @click="pauseOrPlay"
            ></i>
          </button>
          <button @click="next"><i class="el-icon-arrow-right"></i></button>
          <button>
            <i
              :class="{
                'el-icon-refresh-right': playMode === 1,
                'el-icon-refresh': playMode === 0,
              }"
              @click="playMode = playMode === 0 ? 1 : 0"
            ></i>
          </button>
        </div>
        <div class="progress">
          <el-progress
            class="bar"
            :percentage="(currentTime / duration) * 100"
            :show-text="false"
          ></el-progress>
          <span class="time"
            >{{ formatTime(currentTime) }}/{{ formatTime(duration) }}</span
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { listDirByPath } from "../api/api";

import util from "../common/util";

export default {
  name: "MusicBox",
  props: {
    path: String,
  },
  mixins: [util],
  data() {
    return {
      musicList: [],
      page: 1,
      pageCount: 20,
      total: 0,
      curMusic: null,
      audio: null,
      duration: 0,
      currentTime: 0,
      playMode: 0, // 0为列表循环，1为单曲循环
    };
  },
  mounted() {
    this.listDir(this.path, 1);
  },
  destroyed() {
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  },
  methods: {
    listDir(path, page, callback) {
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
            this.musicList = [];
            for (let item of items) {
              item.isDict = item.isDict.Bool;
              let fileType = this.fileType(item);
              if (fileType === "audio") {
                item.play = false;
                item.downloadUrl = this.encodeURI(item.downloadUrls[0].downloadUrl);
                this.musicList.push(item);
              }
            }
            this.musicList.sort((a, b) => {
              if (a.isDict != b.isDict) {
                return (a.isDict ? 0 : 1) - (b.isDict ? 0 : 1);
              } else {
                return a.timestamp - b.timestamp;
              }
            });
            if (callback) {
              callback();
            }
          }
        },
        (errResp) => {
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
    playMusic(item) {
      if (!this.curMusic || item.name !== this.curMusic.name) {
        this.curMusic = {
          ...item,
          play: true,
        };
      } else {
        this.curMusic.play = !this.curMusic.play;
      }
    },
    pauseOrPlay() {
      if (this.curMusic) {
        this.curMusic.play = !this.curMusic.play;
      }
    },
    goto() {
      this.listDir(this.path, this.page);
    },
    next() {
      let index = this.musicList.findIndex((x) => x.id === this.curMusic.id);
      if (index !== this.musicList.length - 1) {
        // 不等于最后一个
        this.curMusic = {
          ...this.musicList[index + 1],
          play: true,
        };
      } else {
        //最后一个了，先判断是不是最后一页
        if (this.page === Math.ceil(this.total / this.pageCount)) {
          //最后一页
          this.page = 1;
        } else {
          this.page++;
        }
        this.listDir(this.path, this.page, () => {
          this.curMusic = {
            ...this.musicList[0],
            play: true,
          };
        });
      }
    },
    previous() {
      let index = this.musicList.findIndex((x) => x.id === this.curMusic.id);
      if (index !== 0) {
        this.curMusic = {
          ...this.musicList[index - 1],
          play: true,
        };
      } else {
        if (this.page === 1) {
          this.page = Math.ceil(this.total / this.pageCount);
        } else {
          this.page--;
        }
        this.listDir(this.path, this.page, () => {
          this.curMusic = {
            ...this.musicList[this.musicList.length - 1],
            play: true,
          };
        });
      }
    },
    formatTime(duration) {
      if (duration) {
        let minute = Math.floor(duration / 60);
        let second = Math.floor(duration % 60);
        return `${minute < 10 ? "0" + minute : minute}:${
          second < 10 ? "0" + second : second
        }`;
      } else {
        return "00:00";
      }
    },
  },
  watch: {
    curMusic: {
      deep: true,
      handler() {
        if (!this.audio) {
          this.audio = new Audio();
          this.audio.onloadeddata = () => {
            this.duration = this.audio.duration;
          };
          this.audio.ontimeupdate = () => {
            this.currentTime = this.audio.currentTime;
            if (this.currentTime >= this.audio.duration) {
              if (this.playMode === 1) {
                // 单曲循环，重新播放
                this.audio.currentTime = 0;
                this.audio.play();
              } else {
                // 列表循环
                this.next();
              }
            }
          };
          this.audio.onerror = () => {
            this.next();
          };
        }

        if (this.audio.src !== this.curMusic.downloadUrl) {
          this.audio.src = this.curMusic.downloadUrl;
        }
        document.title = this.curMusic.name
        if (this.curMusic.play) {
          this.audio.play();
        } else {
          this.audio.pause();
        }

        // 同时修改列表状态
        for (let i = 0; i < this.musicList.length; i++) {
          this.musicList[i].play = false;
        }

        if (this.curMusic.play) {
          let index = this.musicList.findIndex(
            (x) => x.id === this.curMusic.id
          );
          if (index !== -1) {
            this.musicList[index].play = true;
          }
        }
      },
    },
  },
};
</script>

<style scoped>
.musicbox {
  display: flex;
  margin-top: 15px;
}

.musiclist {
  max-width: 320px;
  width: calc(100% - 30px);
  height: 560px;
  padding: 10px 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12), 0 0 6px rgba(0, 0, 0, 0.04);
}

ul,
li {
  padding: 0px;
  margin: 0px;
  list-style: none;
}

li {
  padding-bottom: 5px;
  font-size: 14px;
  cursor: pointer;
  color: #8492a6;
}

li:hover {
  color: #409eff;
}

.musiclist .number {
  display: inline-block;
  width: 20px;
  vertical-align: middle;
}

.musiclist .title {
  display: inline-block;
  width: calc(100% - 30px);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  vertical-align: middle;
}

.active {
  color: #d33a31;
}

.player {
  flex: 1;
  padding: 0px 20px;
  position: relative;
}

.player .title {
  font-size: 16px;
  line-height: 28px;
  text-align: center;
  padding: 10px 40px;
}

.changpian {
  margin-top: 20px;
  width: 200px;
  height: 280px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
}
.changpian .needle {
  width: 74px;
  height: 120px;
  z-index: 10;
  position: absolute;
  left: 63px;
  transform-origin: 10% 0%;
  transition: transform 1s;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes static {
}

.pan {
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  width: 200px;
  height: 200px;
  border-radius: 100px;
  background: rgba(0, 0, 0, 0.1);
  animation-duration: 15s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}
.pan .cover {
  position: absolute;
  left: 40px;
  right: 40px;
  bottom: 40px;
}
.pan .singlecover {
  position: absolute;
  bottom: 10px;
  left: 10px;
  right: 10px;
  width: 180px;
  height: 180px;
}

.controller {
  height: 80px;
  position: absolute;
  bottom: 0px;
  left: 40px;
  right: 0px;
}

.controller .buttons {
  text-align: center;
}

.controller button {
  font-size: 26px;
  background: none;
  outline: none;
  border: 0px;
  padding: 0px 10px;
  cursor: pointer;
  color: rgb(100, 100, 100);
}

.controller button:hover {
  color: black;
}

.controller .progress {
  margin-top: 15px;
  text-align: right;
}

.controller .progress .time {
  display: inline-block;
  margin-top: 6px;
  font-size: 14px;
  color: grey;
}

.mobile-controller {
  position: fixed;
  bottom: 0px;
  left: 0px;
  right: 0px;
  height: 110px;
  background: white;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
}

.mobile-controller .controller {
  left: 120px;
  right: 20px;
  bottom: 10px;
}

.mobile-controller .pan {
  width: 90px;
  height: 90px;
  top: 10px;
  left: 10px;
  position: relative;
}

.mobile-controller .pan .cover {
  position: absolute;
  left: 20px;
  top: 20px;
}

.mobile-controller .pan .singlecover {
  position: absolute;
  left: 5px;
  top: 5px;
  width: 80px;
  height: 80px;
}

@media (max-width: 767px) {
  .mobile-controller {
    display: block;
  }
  .player {
    display: none;
  }
}

@media (min-width: 768px) {
  .mobile-controller {
    display: none;
  }
  .player {
    display: block;
  }
}
</style>
