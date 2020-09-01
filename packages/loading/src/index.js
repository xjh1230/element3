// import { nextTick, defineComponent, createApp, h, render } from 'vue'
import { nextTick, defineComponent, createApp } from 'vue'
import loadingVue from './loading.vue'
// import { addClass, removeClass, getStyle } from 'element-ui/src/utils/dom'
import { addClass, getStyle } from 'element-ui/src/utils/dom'
import { PopupManager } from 'element-ui/src/utils/popup'
// import afterLeave from 'element-ui/src/utils/after-leave'
import merge from 'element-ui/src/utils/merge'

// const LoadingConstructor = {
//   extends: loadingVue
// }

const defaults = {
  text: null,
  fullscreen: true,
  body: false,
  lock: false,
  customClass: ''
}

let fullscreenLoading

const addStyle = (options, parent, instance) => {
  const maskStyle = {}
  if (options.fullscreen) {
    instance.originalPosition = getStyle(document.body, 'position')
    instance.originalOverflow = getStyle(document.body, 'overflow')
    maskStyle.zIndex = PopupManager.nextZIndex()
  } else if (options.body) {
    instance.originalPosition = getStyle(document.body, 'position')
    ;['top', 'left'].forEach((property) => {
      const scroll = property === 'top' ? 'scrollTop' : 'scrollLeft'
      maskStyle[property] =
        options.target.getBoundingClientRect()[property] +
        document.body[scroll] +
        document.documentElement[scroll] +
        'px'
    })
    ;['height', 'width'].forEach((property) => {
      maskStyle[property] =
        options.target.getBoundingClientRect()[property] + 'px'
    })
  } else {
    instance.originalPosition = getStyle(parent, 'position')
  }
  Object.keys(maskStyle).forEach((property) => {
    instance.$el.style[property] = maskStyle[property]
  })
}

const Loading = (options = {}) => {
  // if (Vue.prototype.$isServer) return
  options = merge({}, defaults, options)
  if (typeof options.target === 'string') {
    options.target = document.querySelector(options.target)
  }
  options.target = options.target || document.body
  if (options.target !== document.body) {
    options.fullscreen = false
  } else {
    options.body = true
  }
  if (options.fullscreen && fullscreenLoading) {
    return fullscreenLoading
  }

  const parent = options.body ? document.body : options.target
  // const instance = new LoadingConstructor({
  //   el: document.createElement('div'),
  //   data: options
  // })

  const LoadingConstructor = defineComponent({
    extends: defineComponent(loadingVue),
    data() {
      return options
    },
    methods: {
      close: function () {
        if (this.fullscreen) {
          fullscreenLoading = undefined
        }
        // afterLeave(
        //   this,
        //   (_) => {
        //     const target =
        //       this.fullscreen || this.body ? document.body : this.target
        //     removeClass(target, 'el-loading-parent--relative')
        //     removeClass(target, 'el-loading-parent--hidden')
        //     if (this.$el && this.$el.parentNode) {
        //       this.$el.parentNode.removeChild(this.$el)
        //     }
        //     this.$destroy()
        //   },
        //   300
        // )
        this.visible = false
      }
    }
  })
  const instance = createApp(LoadingConstructor).mount(
    document.createElement('div')
  )
  addStyle(options, parent, instance)
  if (
    instance.originalPosition !== 'absolute' &&
    instance.originalPosition !== 'fixed'
  ) {
    addClass(parent, 'el-loading-parent--relative')
  }
  if (options.fullscreen && options.lock) {
    addClass(parent, 'el-loading-parent--hidden')
  }
  parent.appendChild(instance.$el)
  nextTick(() => {
    instance.visible = true
  })
  if (options.fullscreen) {
    fullscreenLoading = instance
  }
  return instance
}

export default Loading
