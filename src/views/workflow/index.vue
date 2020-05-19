<template>
  <div class="screen-container" v-loading="loading">
    <toolbar v-if="bpmnModeler" :modeler="bpmnModeler"></toolbar>
    <div id="canvas" ref="canvas"></div>
    <div class="panel-container">
      <task-panel v-if="bpmnModeler" :modeler="bpmnModeler" :node-type="nodeType"></task-panel>
      <sequence-flow-panel v-if="bpmnModeler" :modeler="bpmnModeler" :node-type="nodeType"></sequence-flow-panel>
      <start-event-panel v-if="bpmnModeler" :modeler="bpmnModeler" :node-type="nodeType"></start-event-panel>
    </div>
  </div>
</template>

<script>
import BpmnModeler from 'bpmn-js/lib/Modeler' // 绘制流程图
import Toolbar from './components/Toolbar'
import TaskPanel from './components/TaskPanel'
import SequenceFlowPanel from './components/SequenceFlowPanel'
import StartEventPanel from './components/StartEventPanel'
import customTranslate from './translate/customTranslate'
export default {
  name: 'Workflow',
  components: {
    Toolbar,
    TaskPanel,
    SequenceFlowPanel,
    StartEventPanel
  },
  data() {
    return {
      loading: false,
      canvasEl: null,
      bpmnModeler: null,
      nodeType: ''
    }
  },
  mounted() {
    this.init()
    this.modelerListener()
  },
  methods: {
    // 初始化bpmnModeler实例
    async init() {
      // 获取到属性ref为“canvas”的dom节点
      const canvasEl = this.$refs.canvas
      // 汉化
      const customTranslateModule = {
        translate: ['value', customTranslate]
      }
      // 建模
      this.bpmnModeler = new BpmnModeler({
        container: canvasEl,
        additionalModules: [
          customTranslateModule
        ]
      })
      // 先从本地导入.bpmn文件
      const xml = await import('./resource/diagram-8.bpmn')
      this.createDiagram(xml.default)
    },
    modelerListener() {
      // 监听节点选择变化
      this.bpmnModeler.on('selection.changed', e => {
        console.log('页面监听')
        const element = e.newSelection[0]
        if (!element) return
        this.nodeType = element.businessObject.$type
        console.log(this.nodeType)
      })
    },
    // 创建流程图（引入）
    createDiagram(xml) {
      this.bpmnModeler.importXML(xml, err => {
        if (err) {
          console.log(err)
          return
        }
        // 让图能自适应屏幕
        this.bpmnModeler.get('canvas').zoom('fit-viewport')
      })
    }
  }
}
</script>

<style scoped lang="scss">
.screen-container {
  height: calc(100vh - 50px);
  overflow-y: auto;
  padding: 15px;
  position: relative;
  .toolbar-box {
    margin-bottom: 10px;
  }
  #canvas {
    height: 100%;
  }
  .panel-container {
    position: absolute;
    left:35px;
    bottom: 0;
  }
  /*隐藏context-pad中不需要的工具*/
  /deep/ .group[data-group="model"]{
    display: none;
  }
  /*隐藏bpmn链接（绿色图标）*/
  /deep/ .bjs-powered-by {
    display: none;
  }
  /*隐藏不需要的节点类型*/
  /deep/ .bpmn-replace {
    .bpmn-icon-script {
      display: none;
    }
  }
}
</style>
