<template>
<div class="el-tab-pane" v-if="!lazy || loaded || active" v-show="active" role="tabpanel" :aria-hidden="!active" :id="`pane-${paneName}`" :aria-labelledby="`tab-${paneName}`">
    <slot></slot>
</div>
</template>

<script>
import {
    computed,
    reactive,
    watch,
    onUpdated,
    onUnmounted,
    toRefs,
    getCurrentInstance
} from 'vue'
export default {
    name: 'ElTabPane',

    componentName: 'ElTabPane',

    props: {
        label: String,
        labelContent: Function,
        name: String,
        closable: Boolean,
        disabled: Boolean,
        lazy: Boolean
    },

    setup(props, ctx) {
        const _this = getCurrentInstance()
        const state = reactive({
            index: null,
            loaded: false

        })
        const isClosable = computed(() => {
            return props.closable || _this.parent.closable
        })

        const active = computed(() => {
            
            const active_ = _this.parent&&_this.parent.ctx.currentName === (props.name || state.index)
            if (active_) {
                // eslint-disable-next-line vue/no-side-effects-in-computed-properties
                state.loaded = true
            }
            return active_
        })
        const paneName = computed(() => {
            return props.name || state.index
        })
        onUpdated(() => {
            // _this.parent.emit('tab-nav-update')
        })

        return {
            isClosable,
            active,
            paneName,
            ...toRefs(state)
        }
    }

}
</script>
