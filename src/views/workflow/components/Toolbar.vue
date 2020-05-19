<template>
  <div class="toolbar-container">
    <el-button size="mini" type="primary" @click="saveSVG">保存</el-button>
    <el-button size="mini" type="primary" @click="saveDiagram">下载（BPMN）</el-button>
    <el-button size="mini" type="primary" @click="saveSVG">下载（SVG）</el-button>
    <el-button size="mini" type="primary" @click="print">打印</el-button>
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
      <el-button type="primary" size="mini">导入</el-button>
    </el-upload>
    <el-button size="mini" type="primary" @click="zoom('zoom')">放大</el-button>
    <el-button size="mini" type="primary" @click="zoom('narrow')">缩小</el-button>
    <el-button size="mini" type="primary" @click="zoom('normal')">缩放至原比例</el-button>
    <el-button size="mini" type="primary" @click="redo">前进</el-button>
    <el-button size="mini" type="primary" @click="undo">后退</el-button>
  </div>
</template>

<script>
export default {
  name: 'Toolbar',
  props: {
    modeler: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      fileList: [],
      scaleData: {
        scale: 1,
        step: 0.1,
        maxScale: 1.5,
        minScale: 0.5
      }
    }
  },
  methods: {
    // 前进
    redo() {
      this.modeler.get('commandStack').redo()
    },
    // 后退
    undo() {
      this.modeler.get('commandStack').undo()
    },
    // 导入相关
    handleOnchangeFile(file) {
      const reader = new FileReader()
      let data = ''
      reader.readAsText(file.raw)
      reader.onload = (event) => {
        data = event.target.result
        this.modeler.importXML(data, err => {
          if (err) {
            console.log(err)
            return
          }
          this.modeler.get('canvas').zoom('fit-viewport')
        })
      }
    },
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
    saveSVG() {
      const _this = this
      this.modeler.saveSVG((err, data) => {
        if (err) {
          console.log(`保存SVG文件出错：${err}`)
          return
        }
        _this.downloadFile('svg', data)
      })
    },
    saveDiagram() {
      const _this = this
      this.modeler.saveXML({ format: true }, (err, data) => {
        if (err) {
          console.log(`保存XML文件出错：${err}`)
          return
        }
        _this.downloadFile('bpmn', data)
      })
    },
    downloadFile(track, data) {
      const a = document.createElement('a')
      const name = `diagram.${track}`
      a.setAttribute(
        'href',
        `data:application/bpmn20-xml;charset=UTF-8,${encodeURIComponent(data)}`
      )
      a.setAttribute('target', '_blank')
      a.setAttribute('dataTrack', `diagram:download-${track}`)
      a.setAttribute('download', name)
      document.body.append(a)
      a.click()
      document.body.removeChild(a)
    },
    zoom(type) {
      if (type === 'narrow') {
        if (this.scaleData.scale < this.scaleData.minScale) {
          this.$message.info('再小看不清了')
        } else {
          this.scaleData.scale -= this.scaleData.step
          this.modeler.get('canvas').zoom(this.scaleData.scale)
        }
      } else if (type === 'zoom') {
        if (this.scaleData.scale > this.scaleData.maxScale) {
          this.$message.info('再大装不下了')
        } else {
          this.scaleData.scale += this.scaleData.step
          this.modeler.get('canvas').zoom(this.scaleData.scale)
        }
      } else {
        this.scaleData.scale = 1
        this.modeler.get('canvas').zoom(this.scaleData.scale)
      }
    },
    print() {
      this.modeler.saveXML({ format: true }, (err, data) => {
        if (err) {
          console.log(`保存XML文件出错：${err}`)
          return
        }
        console.log(data)
      })
    }
  }
}
</script>

<style scoped lang="scss">
.toolbar-container {
  margin-bottom: 10px;
}
</style>
