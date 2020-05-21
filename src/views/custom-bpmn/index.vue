<template>
  <div class="containerBox">
    <div>
      <el-button type="warning" size="mini" @click="print">打印</el-button>
    </div>
    <div class="content-box">
      <div id="custom-palette" class="palette-box">
      </div>
      <div id="canvas"></div>
    </div>
  </div>
</template>

<script>
import BpmnModeler from 'bpmn-js/lib/Modeler' // 绘制流程图
import CustomModeler from './custom-modeler'
import customTranslate from '@/views/dashboard/translate/customTranslate' // 汉化
export default {
  name: 'CustomBpmn',
  data() {
    return {
      containerEl: null,
      bpmnModeler: null,
      fileList: [],
      currentCanvasXml: '',
      currentElement: {}
    }
  },
  async mounted() {
    const customTranslateModule = {
      translate: ['value', customTranslate]
    }
    this.containerEl = document.getElementById('canvas')
    this.bpmnModeler = new CustomModeler({
      container: this.containerEl,
      additionalModules: [
        customTranslateModule // 汉化
      ]
    })
    this.showChart()
    this.modelerListener()
  },
  methods: {
    async showChart() {
      const importFile = await import('@/views/dashboard/resource/diagram-8.bpmn')
      this.currentCanvasXml = importFile.default
      this.bpmnModeler.importXML(this.currentCanvasXml, (err) => {
        if (!err) {
          console.log('导入成功')
          this.bpmnModeler.get('canvas').zoom('fit-viewport')
        }
      })
    },
    print() {
      this.bpmnModeler.saveXML({ format: true }, (err, data) => {
        if (err) {
          return console.log(err)
        }
        console.log(data)
      })
    },
    // 添加事件监听
    modelerListener() {
      // 监听节点选择变化
      this.bpmnModeler.on('selection.changed', e => {
        const element = e.newSelection[0]
        if (!element) return
        console.log(element)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .containerBox {
    height: calc(100vh - 50px);
    position: relative;
    .content-box {
      display: flex;
      justify-content: flex-start;
      flex-direction: row;
      .palette-box {
        width: 280px;
        min-height: 500px;
        padding: 10px;
        box-sizing: border-box;
      }
      #canvas {
        flex:1;
        min-height: 500px;
      }
      .properties-panel-parent {
        position: absolute;
        top: 0;
        right: 0;
        width: 240px;
        height: 100%;
      }
    }
  }
</style>
