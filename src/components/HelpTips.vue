<template>
  <span>
    &nbsp;
    <el-tooltip
      class="item"
      effect="dark"
      :content="tips"
      placement="bottom"
    >
      <i :class="icon"></i>
    </el-tooltip>
  </span>
</template>

<script>
export default {
  name: "HelpTips",
  props: {
    tips: {
      type: String,
      default: "this is a help text",
    },
    icon: String,
  },
  data() {
    return {};
  },
};
</script>

<style scoped>
i {
  cursor: pointer;
}
</style>