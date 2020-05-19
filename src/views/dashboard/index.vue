<template>
  <div class="containerBox">
    <div>
      <el-button type="primary" size="mini" @click="handleUndo">后退</el-button>
      <el-button type="success" size="mini" @click="handleRedo">前进</el-button>
      <el-button type="warning" size="mini" @click="handleDownload">下载</el-button>
      <el-button type="warning" size="mini" @click="print">打印</el-button>
      <el-button type="primary" size="mini" @click="saveDiagram">保存</el-button>
      <el-upload
        style="display: inline-block;"
        :file-list="fileList"
        class="upload-demo"
        action=""
        :auto-upload="false"
        :show-file-list="false"
        :on-change="handleOnchangeFile"
        :on-remove="handleRemove"
        :before-remove="beforeRemove"
      >
        <el-button type="danger" size="mini">导入</el-button>
      </el-upload>
      <el-button type="primary" size="mini" @click="previewTemp">预览</el-button>
      <el-button type="success" size="mini" @click="handleZoom(true)">放大</el-button>
      <el-button type="warning" size="mini" @click="handleZoom(false)">缩小</el-button>
    </div>
    <div id="canvas" :style="`transform:scale(${scaleData.scale})`"></div>
    <div class="properties-panel-parent" id="js-properties-panel"></div>
    <!--    <property-panel v-if="bpmnModeler" :modeler="bpmnModeler"></property-panel>-->
  </div>
</template>

<script>
import BpmnModeler from 'bpmn-js/lib/Modeler' // 绘制流程图
import BpmnViewer from 'bpmn-js/lib/Viewer' // 预览流程图
import customTranslate from './translate/customTranslate'
// import PropertyPanel from './components/PropertyPanel'

import propertiesPanelModule from 'bpmn-js-properties-panel'
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda'
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json'

export default {
  name: 'Dashboard',
  components: {
    // PropertyPanel
  },
  data() {
    return {
      containerEl: null,
      bpmnModeler: null,
      fileList: [],
      currentCanvasXml: '',
      scaleData: {
        scale: 1,
        step: 0.1,
        maxScale: 2,
        minScale: 0.5
      },
      nodeName: '',
      currentElement: {}
    }
  },
  mounted() {
    const customTranslateModule = {
      translate: ['value', customTranslate]
    }
    this.containerEl = document.getElementById('canvas')
    this.bpmnModeler = new BpmnModeler({
      container: this.containerEl,
      propertiesPanel: {
        parent: '#js-properties-panel'
      },
      additionalModules: [
        customTranslateModule,
        propertiesPanelModule,
        propertiesProviderModule
      ],
      moddleExtensions: {
        camunda: camundaModdleDescriptor
      }
    })
    // this.create()
    this.showChart()
    this.modelerListener()
  },
  methods: {
    // 第一课
    // 创建流程图
    create() {
      this.bpmnModeler.createDiagram(() => {
        this.bpmnModeler.get('canvas').zoom('fit-viewport')
      })
    },
    // 后退
    handleUndo() {
      this.bpmnModeler.get('commandStack').undo()
    },
    // 前进
    handleRedo() {
      this.bpmnModeler.get('commandStack').redo()
    },
    // 下载
    handleDownload() {
      // eslint-disable-next-line handle-callback-err
      this.bpmnModeler.saveXML({ format: true }, (err, data) => {
        const dataTrack = 'bpmn'
        const a = document.createElement('a')
        const name = `diagram.${dataTrack}`
        a.setAttribute(
          'href',
          `data:application/bpmn20-xml;charset=UTF-8,${encodeURIComponent(data)}`
        )
        a.setAttribute('target', '_blank')
        a.setAttribute('dataTrack', `diagram:download-${dataTrack}`)
        a.setAttribute('download', name)
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
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
    // 上传
    handleRemove(file) {
      for (let i = 0; i < this.fileList.length; i++) {
        if (file.name === this.fileList[i].name) {
          this.fileList.splice(i, 1)
        }
      }
    },
    beforeRemove(file) {
      return this.$confirm(`确定移除 ${file.name}？`)
    },
    handleOnchangeFile(file) {
      const reader = new FileReader()
      let data = ''
      reader.readAsText(file.raw)
      reader.onload = (event) => {
        data = event.target.result
        this.bpmnModeler.importXML(data, (err) => {
          if (err) {
            this.$message.info('导入失败')
          } else {
            this.$message.success('导入成功')
          }
        })
      }
    },
    // 第二课
    // 预览
    async previewTemp() {
      // 导入文件
      const importFile = await import('./resource/diagram-3.bpmn')
      this.currentCanvasXml = importFile.default
      this.containerEl = document.getElementById('canvas')
      // 避免缓存，每次清一下
      this.bpmnModeler && this.bpmnModeler.destroy()
      this.scaleData.scale = 1
      this.bpmnModeler = new BpmnViewer({ container: this.containerEl })
      const viewer = this.bpmnModeler
      // eslint-disable-next-line handle-callback-err
      this.bpmnModeler.importXML(this.currentCanvasXml, (err) => {
        if (err) {
          console.error(err)
        } else {
          // 只实现预览，核心代码以下两句足够
          const canvas = viewer.get('canvas')
          canvas.zoom('fit-viewport')
          // 以下代码为：为节点注册鼠标悬浮事件
          const evenBus = this.bpmnModeler.get('eventBus')
          const overlays = this.bpmnModeler.get('overlays')
          evenBus.on('element.hover', (e) => {
            console.log('悬浮')
          })
          evenBus.on('element.out', () => {
            console.log('走出悬浮')
          })
        }
      })
    },
    // 放大/缩小
    handleZoom(flag) {
      if (flag) {
        if (this.scaleData.scale < this.scaleData.maxScale) {
          this.scaleData.scale += this.scaleData.step
        } else {
          this.$message.info('太大啦，屏幕装不下啦')
        }
      } else {
        if (this.scaleData.scale > this.scaleData.minScale) {
          this.scaleData.scale -= this.scaleData.step
        } else {
          this.$message.info('太小啦，看不清了')
        }
      }
      this.$nextTick(() => {
        this.bpmnModeler.get('canvas').zoom('fit-viewport')
      })
    },
    // 第三课
    // 节点
    async showChart() {
      const importFile = await import('./resource/diagram-8.bpmn')
      this.currentCanvasXml = importFile.default
      this.bpmnModeler.importXML(this.currentCanvasXml, (err) => {
        if (!err) {
          // this.getNodeInfoList()
          // this.addEventBusListener()
          // this.addEventBusListenerForSetColor()
          // this.setNodeColor()
        }
      })
    },
    // 获取流程图所有节点信息
    getNodeInfoList() {
      const elementRegistry = this.bpmnModeler.get('elementRegistry')
      console.log(elementRegistry)
      const userTaskList = elementRegistry.filter(
        (item) => {
          console.log(item)
          return item.type === 'bpmn:Task'
        }
      )
      // 此时得到的userTaskList 便是流程图中所有的用户节点的集合
      console.log(userTaskList)
    },
    // 注册节点信息
    addEventBusListener() {
      const eventBus = this.bpmnModeler.get('eventBus')
      const eventType = ['element.click']
      eventType.forEach(eventType => {
        eventBus.on(eventType, e => {
          console.log(e)
          const { element } = e
          if (!e || element.type === 'bpmn:Process') {
            return false
          } else {
            if (eventType === 'element.click') {
              // 节点点击后想要做的处理
              // 此时想要点击节点后，拿到节点实例，通过外部输入更新节点名称
              this.currentElement = element
            }
          }
        })
      })
    },
    // 注册事件监听
    modelerListener() {
      this.bpmnModeler.on('selection.changed', e => {
        const element = e.newSelection[0]
        if (!element) return
        console.log(element)
      })
    },
    // 第四课
    // 设置颜色
    addEventBusListenerForSetColor() {
      const eventBus = this.bpmnModeler.get('eventBus')
      eventBus.on('element.click', (e) => {
        const { element } = e
        if (!e || element.type === 'bpmn:Process') {
          return false
        } else {
          this.nodeName = element.businessObject.name
        }
      })
    },
    setNodeColor() {
      // 目的：为第一个节点添加绿色，为第二个节点添加黄色
      // 实现步骤：1、找到页面里所有节点
      const elementRegistry = this.bpmnModeler.get('elementRegistry')
      console.log(elementRegistry)
      this.nodeList = elementRegistry.filter(
        (item) => item.type === 'bpmn:Task' || item.type === 'bpmn:ServiceTask'
      )
      console.log(this.nodeList)
      const modeling = this.bpmnModeler.get('modeling')
      modeling.setColor(this.nodeList[0], {
        stroke: 'green',
        fill: 'yellow'
      })
    },
    // 事件监听
    saveDiagram() {
      // eslint-disable-next-line handle-callback-err
      this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
        console.log(xml)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .containerBox {
    height: 1500px;
    position: relative;
    #canvas {
      height: calc(100% - 50px);
    }
    .properties-panel-parent {
      position: absolute;
      top: 0;
      right: 0;
      width: 240px;
      height: 100%;
    }
  }
</style>
