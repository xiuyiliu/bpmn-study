<template>
  <div>
    <div>任务节点配置</div>
    <div>节点Id：{{ form.id }}</div>
    <div>节点名称:{{ form.name}}</div>
    <el-button size="mini" type="primary" @click="edit">点击修改</el-button>
    <el-dialog
      title="任务"
      :visible.sync="dialogVisible"
      width="700px"
      :show-close="false"
      :close-on-click-modal="false">
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="form.name" @input="nameChange"></el-input>
        </el-form-item>
        <el-form-item label="模式" prop="mode">
          <el-radio-group v-model="form.mode" @change="modeChange">
            <el-radio label="1">抢占</el-radio>
            <el-radio label="2">会签</el-radio>
            <el-radio label="3">顺序执行</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="操作类型" prop="type">
          <el-checkbox-group v-model="form.type" @change="typeChange">
            <el-checkbox v-for="(item, index) in typeList" :label="item" :key="index">{{ item }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-color-picker v-model="form.color" @active-change="colorChange"></el-color-picker>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="save">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'PropertyPanel',
  props: {
    modeler: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      form: {
        id: '',
        name: '',
        color: null,
        mode: '1', // 模式，单选
        type: [] // 操作类型，多选
      },
      typeList: ['北京', '上海', '广州', '成都'],
      element: {},
      dialogVisible: false
    }
  },
  mounted() {
    this.handleModeler()
  },
  methods: {
    handleModeler() {
      // 监听节点选择变化
      this.modeler.on('selection.changed', e => {
        console.log('节点选择变化')
        const element = e.newSelection[0]
        this.element = element
        console.log(element)
        if (!element) return
        this.form = {
          ...this.form,
          ...element.businessObject,
          ...element.businessObject.$attrs
        }
        if (typeof this.form.type === 'string') {
          this.form.type = this.form.type.split(',')
        }
      })

      //  监听节点属性变化
      this.modeler.on('element.changed', e => {
        console.log('节点属性变化')
        const { element } = e
        if (!element) return
        //  新增节点需要更新回属性面板
        if (element.id === this.form.id) {
          this.form.name = element.businessObject.name
          this.form = { ...this.form }
        }
      })
    },
    // 在这里我们封装一个通用的更新节点属性的方法
    updateProperties(properties) {
      const modeling = this.modeler.get('modeling')
      modeling.updateProperties(this.element, properties)
    },
    // 封装一个更新并保存数据的方法
    // handleClose() {
    //   this.$refs.form.resetFields()
    //   this.dialogVisible = false
    // },
    edit() {
      this.form = {
        ...this.form,
        ...this.element.businessObject,
        ...this.element.businessObject.$attrs
      }
      if (typeof this.form.type === 'string') {
        this.form.type = this.form.type.split(',')
      }
      this.dialogVisible = true
    },
    colorChange(color) {
      const modeling = this.modeler.get('modeling')
      modeling.setColor(this.element, {
        fill: null,
        stroke: color
      })
      modeling.updateProperties(this.element, { color: color })
    },
    nameChange(name) {
      const modeling = this.modeler.get('modeling')
      modeling.updateLabel(this.element, name)
    },
    modeChange(value) {
      this.updateProperties({ mode: value })
    },
    typeChange(value) {
      console.log(value)
      this.updateProperties({ type: value })
    },
    save() {
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped lang="scss">

</style>
