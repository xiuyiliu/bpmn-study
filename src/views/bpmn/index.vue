<template>
  <div class="containerBox">
    <div>
      <el-button type="primary" size="mini" @click="handleUndo">后退</el-button>
      <el-button type="success" size="mini" @click="handleRedo">前进</el-button>
      <el-button type="warning" size="mini" @click="handleDownload">下载</el-button>
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
        <el-button type="danger" size="mini" @click="print">打印</el-button>
      </el-upload>
    </div>
    <div id="canvas"></div>
<!--    <div class="properties-panel-parent" id="js-properties-panel"></div>-->
  </div>
</template>

<script>
import BpmnModeler from 'bpmn-js/lib/Modeler' // 绘制流程图
import customTranslate from '@/views/dashboard/translate/customTranslate' // 汉化

// import propertiesPanelModule from 'bpmn-js-properties-panel' // 属性面板
// import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda' // 属性面板
// import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json' // 属性面板

// 自定义palette
import customModule from './custom'

export default {
  name: 'Bpmn',
  data() {
    return {
      containerEl: null,
      bpmnModeler: null,
      fileList: [],
      currentCanvasXml: '',
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
      // propertiesPanel: {
      //   parent: '#js-properties-panel'
      // },
      additionalModules: [
        customTranslateModule, // 汉化
        customModule // 自定义(左侧工具栏，自定义renderer)
        // propertiesPanelModule,
        // propertiesProviderModule
      ]
      // moddleExtensions: {
      //   camunda: camundaModdleDescriptor
      // }
    })
    this.showChart()
    this.modelerListener()
  },
  methods: {
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
    async showChart() {
      const importFile = await import('@/views/dashboard/resource/diagram-8.bpmn')
      this.currentCanvasXml = importFile.default
      this.bpmnModeler.importXML(this.currentCanvasXml, (err) => {
        if (!err) {
          console.log('导入成功')
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
    #canvas {
      height: 100%;
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
