import TabPane from '../tabs/tab-pane.vue'

/* istanbul ignore next */
TabPane.install = function (app) {
  app.component(TabPane.name, TabPane)
}

export default TabPane
