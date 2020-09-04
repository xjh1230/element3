import ElTabs from './tabs'
import ElTabPane from './tab-pane.vue'

/* istanbul ignore next */
ElTabs.install = function (app) {
  app.component(ElTabs.name, ElTabs)
  app.component(ElTabPane.name, ElTabPane)
}

export default ElTabs
