## Tabs 标签页

分隔内容上有关联但属于不同类别的数据集合。

### 基础用法

基础的、简洁的标签页。

:::demo Tabs 组件提供了选项卡功能，默认选中第一个标签页，你也可以通过 `value` 属性来指定当前选中的标签页。

```html
<template>
  <el-tabs v-model="activeName" @tab-click="handleClick" :activeName="activeName">
    <el-tab-pane label="用户管理" name="first">用户管理</el-tab-pane>
     <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>
    <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>
    <el-tab-pane label="定时任务补偿" name="fourth">定时任务补偿</el-tab-pane>
  </el-tabs>
</template>
<script>
  export default {
    data() {
      return {
        activeName: 'second'
      };
    },
    methods: {
      handleClick(tab, event) {
        console.log(tab, event);
      }
    }
  };
</script>
```
:::


### Tabs Attributes
| 参数       | 说明     | 类型      | 可选值       | 默认值   |
|---------- |-------- |---------- |-------------  |-------- |
| value / v-model  | 绑定值，选中选项卡的 name  | string   |  —  |  第一个选项卡的 name |
| type     | 风格类型   | string   | card/border-card  |     —    |
| closable  | 标签是否可关闭   | boolean   | — |  false  |
| addable  | 标签是否可增加   | boolean   | — |  false  |
| editable  | 标签是否同时可增加和关闭   | boolean   | — |  false  |
| tab-position  | 选项卡所在位置 | string   |  top/right/bottom/left  |  top |
| stretch  | 标签的宽度是否自撑开 | boolean   |  -  |  false |
| before-leave | 切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。 | Function(activeName, oldActiveName) | — | — |

### Tabs Events
| 事件名称 | 说明 | 回调参数 |
|---------- |-------- |---------- |
| tab-click  | tab 被选中时触发 | 被选中的标签 tab 实例 |
| tab-remove  | 点击 tab 移除按钮后触发  | 被删除的标签的 name |
| tab-add  | 点击 tabs 的新增按钮后触发  | — |
| edit  | 点击 tabs 的新增按钮或 tab 被关闭后触发  | (targetName, action) |

### Tab-pane Attributes
| 参数       | 说明     | 类型      | 可选值       | 默认值   |
|---------- |-------- |---------- |-------------  |-------- |
| label     | 选项卡标题   | string   | — |    —     |
| disabled | 是否禁用 | boolean | — | false |
| name      | 与选项卡绑定值 value 对应的标识符，表示选项卡别名 | string | — | 该选项卡在选项卡列表中的顺序值，如第一个选项卡则为'1' |
| closable  | 标签是否可关闭   | boolean   | — |  false  |
| lazy  | 标签是否延迟渲染   | boolean   | — |  false  |
