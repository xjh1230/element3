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
    render,
    getCurrentInstance,
    createVNode
} from 'vue'
import {
  getComponent,
  getOptionProps,
  filterEmpty,
  findDOMNode,
  getPropsData,
//   getSlot,
} from 'element-ui/src/utils/props-utils'
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
            focusable: true,
            tabsNav:[]
        })
        const navStyle = computed(() => {
            const dir = ['top', 'bottom'].indexOf(rootTabs.props.tabPosition) !== -1 ? 'X' : 'Y'
            return {
                transform: `translate${dir}(-${state.navOffset}px)`
            }
        })
        const sizeName = computed(() => {
            return ['top', 'bottom'].indexOf(rootTabs.props.tabPosition) !== -1? 'width' : 'height';
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
            const isHorizontal = ['top', 'bottom'].indexOf(rootTabs.props.tabPosition) !== -1
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
             const _this = getCurrentInstance()
            if (!_this.refs.nav) return
            const sizeName = _this.ctx.sizeName
            const navSize = _this.refs.nav[`offset${firstUpperCase(sizeName)}`]
            const containerSize = _this.refs.navScroll[
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
          console.log(state.tabsNav,12324463443543543)
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
render() {
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
      rootTabs,
      isFocus,
      tabsNav
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
      const props = getPropsData(pane)
      // const props1 = getOptionProps(pane)
      // console.log(props,props1,_this)
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
      const isActive= _this.parent.ctx.currentName==(tabName||index)
      const tabindex =isActive? 0 : -1
      return (
        <div
          class={{
            'el-tabs__item': true,
            [`is-${rootTabs.props.tabPosition}`]: true,
            'is-active': isActive,
            'is-disabled': props.disabled,
            'is-closable': closable,
            'is-focus': isFocus
          }}
          id={`tab-${tabName}`}
          key={`tab-${tabName}`}
          aria-controls={`pane-${tabName}`}
          role="tab"
          aria-selected={isActive}
          // ref="tabs"
          ref={el => { tabsNav.push(el)  }}
          tabindex={tabindex}
          refInFor
          onFocus={() => {
            console.log('focus')
            setFocus()
          }}
          onBlur={() => {
            console.log('blur')
            removeFocus()
          }}
          onClick={(ev) => {
            removeFocus()
            onTabClick(pane, tabName, ev)
          }}
          onKeydown={(ev) => {
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
 
    const renderTabBar=() => !type&&panes.length>0 ? <tab-bar ref="sad"  tabs={panes} ></tab-bar> : null
    return (
      <div
        class={[
          'el-tabs__nav-wrap',
          scrollable ? 'is-scrollable' : '',
          `is-${rootTabs.props.tabPosition}`
        ]}
      >
      {scrollBtn}
        <div class={['el-tabs__nav-scroll']} ref="navScroll">
          <div
            class={[
              'el-tabs__nav',
              `is-${rootTabs.props.tabPosition}`,
              stretch &&
              ['top', 'bottom'].indexOf(rootTabs.props.tabPosition) !== -1
                ? 'is-stretch'
                : ''
            ]}
            ref="nav"
            style={navStyle}
            role="tablist"
            on-keydown={changeTab}
          >
           {renderTabBar()}
           {tabs}
          </div>
        </div>
      </div>
    )
  }
}
</script>
