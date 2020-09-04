<script>
import TabBar from './tab-bar'
import {
    addResizeListener,
    removeResizeListener
} from 'element-ui/src/utils/resize-event'
import {
    inject,
    computed,
    reactive,
    onUpdated,
    onMounted,
    onUnmounted,
    toRefs,
    renderList,
    getCurrentInstance,
    createVNode
} from 'vue'

function noop() {}
const firstUpperCase = (str) => {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
}

export default {
    name: 'TabNav',

    components: {
        TabBar
    },

    //   inject: ['rootTabs'],

    props: {
        panes: Array,
        currentName: String,
        editable: Boolean,
        onTabClick: {
            type: Function,
            default: noop
        },
        onTabRemove: {
            type: Function,
            default: noop
        },
        type: String,
        stretch: Boolean
    },

    setup(props, ctx) {
        const rootTabs = inject('rootTabs')
        const _this = getCurrentInstance()
        const state = reactive({
            scrollable: false,
            navOffset: 0,
            isFocus: false,
            focusable: true
        })
        const navStyle = computed(() => {
            const dir = ['top', 'bottom'].indexOf(rootTabs.tabPosition) !== -1 ? 'X' : 'Y'
            return {
                transform: `translate${dir}(-${state.navOffset}px)`
            }
        })
        const sizeName = computed(() => {
            return ['top', 'bottom'].indexOf(rootTabs.tabPosition) !== -1
        })
        const scrollPrev = () => {
            const containerSize = ctx.$refs.navScroll[
                `offset${firstUpperCase(sizeName)}`
            ]
            const currentOffset = state.navOffset
            if (!currentOffset) return
            const newOffset = currentOffset > containerSize ? currentOffset - containerSize : 0

            state.navOffset = newOffset
        }

        const scrollNext = () => {
            const navSize = ctx.$refs.nav[`offset${firstUpperCase(sizeName)}`]
            const containerSize = ctx.$refs.navScroll[
                `offset${firstUpperCase(sizeName)}`
            ]
            const currentOffset = state.navOffset

            if (navSize - currentOffset <= containerSize) return

            const newOffset =
                navSize - currentOffset > containerSize * 2 ?
                currentOffset + containerSize :
                navSize - containerSize

            state.navOffset = newOffset
        }
        const scrollToActiveTab = () => {
            if (!state.scrollable) return
            const nav = ctx.$refs.nav
            const activeTab = _this.el.querySelector('.is-active')
            if (!activeTab) return
            const navScroll = ctx.$refs.navScroll
            const isHorizontal = ['top', 'bottom'].indexOf(rootTabs.tabPosition) !== -1
            const activeTabBounding = activeTab.getBoundingClientRect()
            const navScrollBounding = navScroll.getBoundingClientRect()
            const maxOffset = isHorizontal ?
                nav.offsetWidth - navScrollBounding.width :
                nav.offsetHeight - navScrollBounding.height
            const currentOffset = state.navOffset
            let newOffset = currentOffset

            if (isHorizontal) {
                if (activeTabBounding.left < navScrollBounding.left) {
                    newOffset =
                        currentOffset - (navScrollBounding.left - activeTabBounding.left)
                }
                if (activeTabBounding.right > navScrollBounding.right) {
                    newOffset =
                        currentOffset + activeTabBounding.right - navScrollBounding.right
                }
            } else {
                if (activeTabBounding.top < navScrollBounding.top) {
                    newOffset =
                        currentOffset - (navScrollBounding.top - activeTabBounding.top)
                }
                if (activeTabBounding.bottom > navScrollBounding.bottom) {
                    newOffset =
                        currentOffset +
                        (activeTabBounding.bottom - navScrollBounding.bottom)
                }
            }
            newOffset = Math.max(newOffset, 0)
            state.navOffset = Math.min(newOffset, maxOffset)
        }
        const update = () => {
            if (!ctx.$refs.nav) return
            const sizeName = sizeName
            const navSize = ctx.$refs.nav[`offset${firstUpperCase(sizeName)}`]
            const containerSize = ctx.$refs.navScroll[
                `offset${firstUpperCase(sizeName)}`
            ]
            const currentOffset = state.navOffset

            if (containerSize < navSize) {
                const currentOffset = state.navOffset
                state.scrollable = state.scrollable || {}
                state.scrollable.prev = currentOffset
                state.scrollable.next = currentOffset + containerSize < navSize
                if (navSize - currentOffset < containerSize) {
                    state.navOffset = navSize - containerSize
                }
            } else {
                state.scrollable = false
                if (currentOffset > 0) {
                    state.navOffset = 0
                }
            }
        }
        const changeTab = function (e) {
            const keyCode = e.keyCode
            let nextIndex
            let currentIndex, tabList
            if ([37, 38, 39, 40].indexOf(keyCode) !== -1) {
                // 左右上下键更换tab
                tabList = e.currentTarget.querySelectorAll('[role=tab]')
                currentIndex = Array.prototype.indexOf.call(tabList, e.target)
            } else {
                return
            }
            if (keyCode === 37 || keyCode === 38) {
                // left
                if (currentIndex === 0) {
                    // first
                    nextIndex = tabList.length - 1
                } else {
                    nextIndex = currentIndex - 1
                }
            } else {
                // right
                if (currentIndex < tabList.length - 1) {
                    // not last
                    nextIndex = currentIndex + 1
                } else {
                    nextIndex = 0
                }
            }
            tabList[nextIndex].focus() // 改变焦点元素
            tabList[nextIndex].click() // 选中下一个tab
            this.setFocus()
        }
        const setFocus = () => {
            if (state.focusable) {
                state.isFocus = true
            }
        }
        const removeFocus = () => {
            state.isFocus = false
        }
        const visibilityChangeHandler = () => {
            const visibility = document.visibilityState
            if (visibility === 'hidden') {
                state.focusable = false
            } else if (visibility === 'visible') {
                setTimeout(() => {
                        state.focusable = true
                    },
                    50)
            }
        }
        const windowBlurHandler = () => {
            state.focusable = false
        }
        const windowFocusHandler = () => {
            setTimeout(() => {
                    state.focusable = true
                },
                50)
        }

        onUpdated(() => {
            update()
        })
        onMounted(() => {
            // addResizeListener(_this.el, update)
            document.addEventListener('visibilitychange', visibilityChangeHandler)
            window.addEventListener('blur', windowBlurHandler)
            window.addEventListener('focus', windowFocusHandler)
            setTimeout(() => {
                scrollToActiveTab()
            }, 0)
        })
        onUnmounted(() => {
            if (_this.el && update) removeResizeListener(_this.el, update)
            document.removeEventListener(
                'visibilitychange',
                visibilityChangeHandler
            )
            window.removeEventListener('blur', windowBlurHandler)
            window.removeEventListener('focus', windowFocusHandler)

        })

        return {
            ...toRefs(state),
            navStyle,
            sizeName,
            scrollPrev,
            scrollNext,
            scrollToActiveTab,
            update,
            changeTab,
            setFocus,
            removeFocus,
            visibilityChangeHandler,
            windowBlurHandler,
            windowFocusHandler,
            rootTabs
        }
    },
render(h) {
    const {
      type,
      panes,
      editable,
      stretch,
      onTabClick,
      onTabRemove,
      navStyle,
      scrollable,
      scrollNext,
      scrollPrev,
      changeTab,
      setFocus,
      removeFocus,
      rootTabs
    } = this
    const _this = getCurrentInstance()
    const scrollBtn = scrollable
      ? [
          <span
            class={['el-tabs__nav-prev', scrollable.prev ? '' : 'is-disabled']}
            on-click={scrollPrev}
          >
            <i class="el-icon-arrow-left"></i>
          </span>,
          <span
            class={['el-tabs__nav-next', scrollable.next ? '' : 'is-disabled']}
            on-click={scrollNext}
          >
            <i class="el-icon-arrow-right"></i>
          </span>
        ]
      : null

    const tabs = renderList(panes, (pane, index) => {
      const node = createVNode(pane)
      const tabName = pane.props.name || pane.props.index || index
      const closable = pane.isClosable || editable

      pane.index = `${index}`

      const btnClose = closable ? (
        <span
          class="el-icon-close"
          on-click={(ev) => {
            onTabRemove(pane, ev)
          }}
        ></span>
      ) : null

      const tabLabelContent =   pane.props.label
      const tabindex = pane.active ? 0 : -1
      return (
        <div
          class={{
            'el-tabs__item': true,
            [`is-${rootTabs.tabPosition}`]: true,
            'is-active': pane.active,
            'is-disabled': pane.disabled,
            'is-closable': closable,
            'is-focus': state.isFocus
          }}
          id={`tab-${tabName}`}
          key={`tab-${tabName}`}
          aria-controls={`pane-${tabName}`}
          role="tab"
          aria-selected={pane.active}
          ref="tabs"
          tabindex={tabindex}
          refInFor
          on-focus={() => {
            setFocus()
          }}
          on-blur={() => {
            removeFocus()
          }}
          on-click={(ev) => {
            removeFocus()
            onTabClick(pane, tabName, ev)
          }}
          on-keydown={(ev) => {
            if (closable && (ev.keyCode === 46 || ev.keyCode === 8)) {
              onTabRemove(pane, ev)
            }
          }}
        >
          {tabLabelContent}
          {btnClose}
        </div>
      )
    })
    return (
      <div
        class={[
          'el-tabs__nav-wrap',
          scrollable ? 'is-scrollable' : '',
          `is-${rootTabs.tabPosition}`
        ]}
      >
        {scrollBtn}
        <div class={['el-tabs__nav-scroll']} ref="navScroll">
          <div
            class={[
              'el-tabs__nav',
              `is-${rootTabs.tabPosition}`,
              stretch &&
              ['top', 'bottom'].indexOf(rootTabs.tabPosition) !== -1
                ? 'is-stretch'
                : ''
            ]}
            ref="nav"
            style={navStyle}
            role="tablist"
            on-keydown={changeTab}
          >
            {!type ? <tab-bar tabs={panes}></tab-bar> : null}
            {tabs}
          </div>
        </div>
      </div>
    )
  }
}
</script>
