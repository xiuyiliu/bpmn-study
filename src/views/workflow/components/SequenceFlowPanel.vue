<template>
  <div v-show="nodeType === 'bpmn:SequenceFlow'">
    <div><span>ID：</span><span>{{ form.id }}</span></div>
    <el-link type="primary" :underline="false" @click="showDrawer">修改</el-link>
    <div class="container">
      <el-drawer
        :visible.sync="drawerVisible"
        :with-header="false"
        :before-close="handleClose">
        <div class="container">
          <el-form ref="form" :model="form" label-width="80px">
            <el-form-item label="变量名称" prop="variable">
              <el-input v-model="form.variable"></el-input>
            </el-form-item>
            <el-form-item label="运算符" prop="operator">
              <el-select v-model="form.operator" placeholder="请选择活动区域">
                <el-option label="大于" value=">"></el-option>
                <el-option label="大于等于" value=">="></el-option>
                <el-option label="小于" value="<"></el-option>
                <el-option label="小于等于" value="<="></el-option>
                <el-option label="等于" value="="></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="变量值" prop="variableValue">
              <el-input v-model="form.variableValue"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="onSubmit">保存</el-button>
              <el-button @click="cancel">取消</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-drawer>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SequenceFlowPropertiesPanel',
  props: {
    modeler: {
      type: Object,
      required: true
    },
    nodeType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      drawerVisible: false,
      form: {
        id: ''
      },
      element: {}
    }
  },
  mounted() {
    this.modelerListener()
  },
  methods: {
    showDrawer() {
      this.drawerVisible = true
    },
    handleClose() {
      this.drawerVisible = false
    },
    resetForm() {
      this.form = {
        id: ''
      }
    },
    // 添加事件监听
    modelerListener() {
      // 监听节点选择变化
      this.modeler.on('selection.changed', e => {
        this.resetForm()
        const element = e.newSelection[0]
        if (!element) return
        this.element = element
        const conditionBody = element.businessObject.conditionExpression ? element.businessObject.conditionExpression.body : {}
        this.form = {
          ...this.form,
          ...element.businessObject,
          ...element.businessObject.$attrs
        }
      })
    },
    onSubmit() {
      const _this = this
      const moddle = _this.modeler.get('moddle')
      const newCondition = moddle.create('bpmn:FormalExpression', {
        body: '${' + _this.form.variable + _this.form.operator + _this.form.variableValue + '}'
      })
      const modeling = this.modeler.get('modeling')
      modeling.updateProperties(this.element, {
        conditionExpression: newCondition
      })
      this.handleClose()
    },
    cancel() {
      console.log(this.form)
    }
  }
}
</script>

<style scoped lang="scss">
  .container {
    padding: 30px 15px 15px 15px;
  }
</style>
