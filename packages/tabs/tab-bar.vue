<template>
<div class="el-tabs__active-bar" :class="`is-${rootTabs.tabPosition}`" :style="barStyle"></div>
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
        const barStyle = computed(() => {
            const style = {}
            let offset = 0
            let tabSize = 0
            const sizeName = ['top', 'bottom'].indexOf(rootTabs.tabPosition) !== -1 ?
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
        return {
            barStyle,
            rootTabs
        }
    }
}
</script>
