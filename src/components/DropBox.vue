<template>
  <div>
    <div class="dropbox" @drop="drop" v-if="showDropBox" @dragover="dragover" @dragend="showDropBox = false"
      @dragleave="showDropBox = false">
        将文件拖到此处即可上传文件
    </div>
  </div>
</template>

<script>


export default {
  name: "DropBox",
  props: {
  },
  data() {
    return {
      showDropBox: false,
    };
  },
  mounted() {

    this.$root.$on("dragenter", () => {
      this.showDropBox = true
    })

  },
  destroyed() {

  },
  methods: {
    dragover(e) {
      e.preventDefault()
    },
    drop(e) {
      this.showDropBox = false
      e.preventDefault()
      let files = e.dataTransfer.files
      if(files.length > 0){
        this.$emit("fileDrop",files)
      }
    }
  },
  watch: {

  },
};
</script>

<style scoped>
.dropbox {
  position: fixed;
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
  background: rgba(0, 0, 0, 0.6);
  z-index: 999;
  vertical-align: middle;
  font-size: 60px;
  color: white;
  border-radius: 16px;
  vertical-align: middle;
  text-align: center;
  letter-spacing:6px;
  line-height:100vh;
  
}
</style>