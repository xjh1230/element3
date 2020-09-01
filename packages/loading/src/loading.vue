<template>
  <transition name="el-loading-fade" @after-leave="handleAfterLeave">
    <div
      v-show="visible"
      class="el-loading-mask"
      :style="{ backgroundColor: background || '' }"
      :class="[customClass, { 'is-fullscreen': fullscreen }]"
    >
      <div class="el-loading-spinner">
        <svg v-if="!spinner" class="circular" viewBox="25 25 50 50">
          <circle class="path" cx="50" cy="50" r="20" fill="none" />
        </svg>
        <i v-else :class="spinner"></i>
        <p v-if="text" class="el-loading-text">{{ text }}</p>
      </div>
    </div>
  </transition>
</template>

<script>
// import { setup, reactive } from 'vue'
export default {
  data() {
    return {
      text: null,
      spinner: null,
      background: null,
      fullscreen: true,
      visible: false,
      customClass: ''
    }
  },
  methods: {
    handleAfterLeave() {
      this.$emit('after-leave')
    },
    setText(text) {
      this.text = text
    }
  }
  // setup(props, {
  //     emit
  // }) {
  //     const data = reactive({
  //         text: null,
  //         spinner: null,
  //         background: null,
  //         fullscreen: true,
  //         visible: false,
  //         customClass: ''
  //     })
  //     const handleAfterLeave = () => {
  //         emit('after-leave')
  //     }
  //     const setText = (text) => {
  //         data.text = text
  //     }
  //     return {
  //         ...data,
  //         handleAfterLeave,
  //         setText
  //     }
  // }
}
</script>
