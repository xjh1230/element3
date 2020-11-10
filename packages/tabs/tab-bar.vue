<template>
<div class="el-tabs__active-bar" :class="`is-${rootTabs.props.tabPosition}`" :style="barStyle">
<a ref='testa'>点我1</a>
<a ref='testa'>点我2</a>
<a ref='testa'>点我3</a>
<a ref='testa'>点我4</a>
</div>
</template>

<script>
import {
    arrayFind
} from 'element-ui/src/utils/util'
import {
    inject,
    computed,
    reactive,
    onUpdated,
    onMounted,
    onUnmounted,
    toRefs,
    renderList,
    getCurrentInstance
} from 'vue'

export default {
    name: 'TabBar',

    props: {
        tabs: Array
    },

    setup(props, ctx) {
        const _this = getCurrentInstance()
        const rootTabs = inject('rootTabs')
          const state = reactive({
            barStyle:{

            }
        })
        const setStyle=()=>{
             const style = {}
            let offset = 0
            let tabSize = 0
            const sizeName = ['top', 'bottom'].indexOf(rootTabs.props.tabPosition) !== -1 ?
                'width' :
                'height'
            const sizeDir = sizeName === 'width' ? 'x' : 'y'
            const firstUpperCase = (str) => {
                return str
                    .toLowerCase()
                    .replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
            }
            console.log( _this.parent.refs.tabs)
            console.log(_this.parent.ctx.tabsNav)
            props.tabs.every((tab, index) => {
                const list = _this.parent.refs.nav.children || []
                const $el = arrayFind(
                    list,
                    (t) => t.id&&t.id.replace('tab-', '') === tab.props.name
                )
                if (!$el) {
                    return false
                }
                const isActive= _this.parent.ctx.currentName== tab.props.name
                if (!isActive) {
                    offset += $el[`client${firstUpperCase(sizeName)}`]
                    return true
                } else {
                    tabSize = $el[`client${firstUpperCase(sizeName)}`]
                    const tabStyles = window.getComputedStyle($el)
                    if (sizeName === 'width' && props.tabs.length > 1) {
                        tabSize -=
                            parseFloat(tabStyles.paddingLeft) +
                            parseFloat(tabStyles.paddingRight)
                    }
                    if (sizeName === 'width') {
                        offset += parseFloat(tabStyles.paddingLeft)
                    }
                    return false
                }
            })

            const transform = `translate${firstUpperCase(sizeDir)}(${offset}px)`
            style[sizeName] = tabSize + 'px'
            style.transform = transform
            style.msTransform = transform
            style.webkitTransform = transform
            state.barStyle=style
        }
        const barStyle1 = computed(() => {
            const style = {}
            let offset = 0
            let tabSize = 0
            const sizeName = ['top', 'bottom'].indexOf(rootTabs.props.tabPosition) !== -1 ?
                'width' :
                'height'
            const sizeDir = sizeName === 'width' ? 'x' : 'y'
            const firstUpperCase = (str) => {
                return str
                    .toLowerCase()
                    .replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
            }
            props.tabs.every((tab, index) => {
                const $el = arrayFind(
                    _this.parent.refs.tabs || [],
                    (t) => t.id.replace('tab-', '') === tab.paneName
                )
                if (!$el) {
                    return false
                }
                
                if (!tab.active) {
                    offset += $el[`client${firstUpperCase(sizeName)}`]
                    return true
                } else {
                    tabSize = $el[`client${firstUpperCase(sizeName)}`]
                    const tabStyles = window.getComputedStyle($el)
                    if (sizeName === 'width' && this.tabs.length > 1) {
                        tabSize -=
                            parseFloat(tabStyles.paddingLeft) +
                            parseFloat(tabStyles.paddingRight)
                    }
                    if (sizeName === 'width') {
                        offset += parseFloat(tabStyles.paddingLeft)
                    }
                    return false
                }
            })

            const transform = `translate${firstUpperCase(sizeDir)}(${offset}px)`
            style[sizeName] = tabSize + 'px'
            style.transform = transform
            style.msTransform = transform
            style.webkitTransform = transform

            return style
        })
        onMounted(()=>{
            setStyle()
        })
        return {
            rootTabs,
              ...toRefs(state),
        }
    }
}
</script>
