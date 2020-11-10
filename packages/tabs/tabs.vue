<script>
import TabNav from './tab-nav'
import {
    provide,
    computed,
    reactive,
    readonly,
    onUpdated,
    onMounted,
    onBeforeMount,
    onUnmounted,
    toRefs,
    ref,
    watch,
    nextTick,
    getCurrentInstance,
    createApp,
    createVNode,
    h,
    render, isVNode
} from 'vue'
import {
  getComponent,
  getOptionProps,
  filterEmpty,
  findDOMNode,
  getPropsData,
//   getSlot,
} from 'element-ui/src/utils/props-utils'
export default {
    name: 'ElTabs',

    components: {
        TabNav
    },

    props: {
        type: String,
        activeName: String,
        closable: Boolean,
        addable: Boolean,
        value: {},
        editable: Boolean,
        tabPosition: {
            type: String,
            default: 'top'
        },
        beforeLeave: Function,
        stretch: Boolean
    },
    

    setup(props, ctx) {
        const navRef = ref('')
        const state = reactive({
            currentName: props.value || props.activeName,
            panes: [],
            paneSlots:[]
        })
        const _this = getCurrentInstance()
        provide('rootTabs', readonly(_this))
        watch(
            ()=>props.value,
            (newVal) => {
                setCurrentName(value)
            }
        )
        watch(
            ()=>props.activeName,
            (newVal) => {
                setCurrentName(value)
            }
        )
        watch(
            () => state.currentName,
            (newVal) => {
                if (navRef) {
                    nextTick(() => {
                        nextTick((_) => {
                            //  navRef.scrollToActiveTab()
                        })
                    })
                }
            }
        )
        

        const calcPaneInstances = (isForceUpdate = false) => {
        //    const _this=getCurrentInstance()
        
           console.log(_this)
            if (_this.slots.default) {
                const comp = getComponent(_this.ctx);
                // console.log(comp)
                // var vnode = _this.slots.default()[0];
                // console.log(isVNode(vnode),vnode)
                const paneSlots = _this.slots.default().filter(
                    (vnode) =>
                    vnode.type &&
                    vnode.type.componentName &&
                    vnode.type.componentName === 'ElTabPane'
                )
                // update indeed
                const panes = paneSlots.map(
                    s => {
                        return s
                    }
                )
                const tmp = panes.every((pane, index) =>{ 
                    console.log(pane,index); 
                    return pane == state.panes[index]}
                )
                console.log(tmp,'tmp')
                const panesChanged = !(
                    panes.length === state.panes.length &&tmp
                    )
                if (isForceUpdate || panesChanged) {//
                    state.paneSlots=paneSlots
                    state.panes = panes
                }
            } else if (state.panes.length !== 0) {
                state.paneSlots = []
                state.panes = []
            }
        }
        const handleTabClick = (tab, tabName, event) => {
            console.log(123456);
            if (tab.disabled) return
            setCurrentName(tabName)
            ctx.emit('tab-click', tab, event)
        }
        const handleTabRemove = (pane, ev) => {
            if (pane.disabled) return
            ev.stopPropagation()
            ctx.emit('edit', pane.name, 'remove')
            ctx.emit('tab-remove', pane.name)
        }
        const handleTabAdd = () => {
            ctx.emit('edit', null, 'add')
            ctx.emit('tab-add')
        }
        const setCurrentName = (value) => {
            const changeCurrentName = () => {
                state.currentName = value
                ctx.emit('input', value)
            }
            if (state.currentName !== value && props.beforeLeave) {
                const before = props.beforeLeave(value, state.currentName)
                if (before && before.then) {
                    before.then(
                        () => {
                            changeCurrentName()
                            navRef && navRef.removeFocus()
                        }
                    )
                } else if (before !== false) {
                    changeCurrentName()
                }
            } else {
                changeCurrentName()
            }
        }
        if (!state.currentName) {
            setCurrentName('second')
        }
        const onTabnavUpdate = function () {
            calcPaneInstances.bind(null, true)
        }
        onUpdated(() => {
            // calcPaneInstances()
        })
        onMounted(() => {
            calcPaneInstances()
        })

        // calcPaneInstances()
        return{
            ...toRefs(state),
            // calcPaneInstances,
            handleTabClick,
            handleTabRemove,
            handleTabAdd,
            setCurrentName,
            onTabnavUpdate,
            navRef
        }
    },
    render() {
      let {
        type,
        handleTabClick,
        handleTabRemove,
        handleTabAdd,
        currentName,
        panes,
        editable,
        addable,
        tabPosition,
        stretch
      } = this;
      const newButton = editable || addable
        ? (
          <span
            class="el-tabs__new-tab"
            on-click={ handleTabAdd }
            tabindex="0"
            on-keydown={ (ev) => { if (ev.keyCode === 13) { handleTabAdd(); }} }
          >
            <i class="el-icon-plus"></i>
          </span>
        )
        : null;

      const navData = {
        props: {
          currentName,
          onTabClick: handleTabClick,
          onTabRemove: handleTabRemove,
          editable,
          type,
          panes,
          stretch
        },
        ref: 'nav'
      };
      //<tab-nav { ...navData.props }></tab-nav>
      const header = (
        <div class={['el-tabs__header', `is-${tabPosition}`]}>
          {newButton}
          <tab-nav { ...navData.props  }  ref="nav" ></tab-nav>
        </div>
      );
      const panels = (
        <div class="el-tabs__content">
          {this.$slots.default()}
        </div>
      );

      return (
        <div class={{
          'el-tabs': true,
          'el-tabs--card': type === 'card',
          [`el-tabs--${tabPosition}`]: true,
          'el-tabs--border-card': type === 'border-card'
        }}>
          { tabPosition !== 'bottom' ? [header, panels] : [panels, header] }
        </div>
      );
    }
}
</script>
