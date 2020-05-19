<template>
  <div v-show="nodeType === 'bpmn:UserTask'">
    <div><span>ID：</span><span>{{ form.id }}</span></div>
    <div><span>节点名称：</span><span>{{ form.name }}</span></div>
    <el-link type="primary" :underline="false" @click="showDrawer">修改</el-link>
    <el-drawer
      :visible.sync="drawerVisible"
      :with-header="false"
      :before-close="handleClose">
      <div class="container">
        <!--任务节点属性面板-->
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="活动名称" prop="name">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="活动区域" prop="region">
            <el-select v-model="form.region" placeholder="请选择活动区域">
              <el-option label="区域一" value="shanghai"></el-option>
              <el-option label="区域二" value="beijing"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="即时配送" prop="delivery">
            <el-switch v-model="form.delivery"></el-switch>
          </el-form-item>
          <el-form-item label="活动性质" prop="type">
            <el-checkbox-group v-model="form.type">
              <el-checkbox label="复选框 A" name="type"></el-checkbox>
              <el-checkbox label="复选框 B" name="type"></el-checkbox>
              <el-checkbox label="复选框 C" name="type"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="特殊资源" prop="resource">
            <el-radio-group v-model="form.resource">
              <el-radio label="线上品牌商赞助"></el-radio>
              <el-radio label="线下场地免费"></el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="活动形式">
            <el-input type="textarea" v-model="form.desc"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveTaskForm">保存</el-button>
            <el-button @click="cancel">取消</el-button>
          </el-form-item>
        </el-form>
        <!--顺序流属性面板-->
<!--        <el-form v-show="nodeType === 'bpmn:SequenceFlow'" ref="flowForm" :model="flowForm" label-width="80px">-->
<!--          <el-form-item label="变量名称" prop="variable">-->
<!--            <el-input v-model="flowForm.variable"></el-input>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="运算符" prop="operator">-->
<!--            <el-select v-model="flowForm.operator" placeholder="请选择活动区域">-->
<!--              <el-option label="大于" value=">"></el-option>-->
<!--              <el-option label="大于等于" value=">="></el-option>-->
<!--              <el-option label="小于" value="<"></el-option>-->
<!--              <el-option label="小于等于" value="<="></el-option>-->
<!--              <el-option label="等于" value="="></el-option>-->
<!--            </el-select>-->
<!--          </el-form-item>-->
<!--          <el-form-item label="变量值" prop="variableValue">-->
<!--            <el-input v-model="flowForm.variableValue"></el-input>-->
<!--          </el-form-item>-->
<!--          <el-form-item>-->
<!--            <el-button type="primary" @click="saveFlowForm">保存</el-button>-->
<!--            <el-button @click="cancel">取消</el-button>-->
<!--          </el-form-item>-->
<!--        </el-form>-->
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'PropertiesPanel',
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
        id: '',
        name: '',
        region: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      },
      // flowForm: {
      //   id: ''
      // },
      // nodeType: '',
      element: {},
      bpmnFactory: null
    }
  },
  mounted() {
    this.bpmnFactory = this.modeler.get('bpmnFactory')
    this.modelerListener()
  },
  methods: {
    // 添加事件监听
    modelerListener() {
      // 监听节点选择变化
      this.modeler.on('selection.changed', e => {
        const element = e.newSelection[0]
        if (!element) return
        this.element = element
        // this.nodeType = element.businessObject.$type
        this.resetForm()
        // this.assignObject(this.nodeType, element)
        // 将扩展属性作为节点标签的属性的情况
        // this.form = {
        //   ...this.form,
        //   ...element.businessObject,
        //   ...element.businessObject.$attrs
        // }
        // 由于属性上存储的都是字符串，所以如有需要，先将其转换为数组
        // if (typeof this.form.type === 'string') {
        //   this.form.type = this.form.type.split(',')
        // }
        // 将扩展属性放在docomentation标签的情况
        const documentations = this.element.businessObject.get('documentation')
        let documentationText
        if (documentations && documentations.length > 0) {
          documentationText = JSON.parse(documentations[0].text)
        } else {
          documentationText = {}
        }
        this.form = {
          ...this.form,
          ...element.businessObject,
          ...documentationText
        }
      })
      // 监听节点属性变化
      this.modeler.on('element.changed', e => {
        console.log(e.element)
      })
    },
    assignObject(nodeType, element) {
      if (nodeType === 'bpmn:UserTask') {
        this.form = {
          ...this.form,
          ...element.businessObject,
          ...element.businessObject.$attrs
        }
        // 由于属性上存储的都是字符串，所以如有需要，先将其转换为数组
        if (typeof this.form.type === 'string') {
          this.form.type = this.form.type.split(',')
        }
      } else if (nodeType === 'bpmn:SequenceFlow') {
        this.flowForm = {
          ...this.flowForm,
          ...element.businessObject,
          ...element.businessObject.$attrs
        }
      }
    },
    showDrawer() {
      this.drawerVisible = true
    },
    resetForm() {
      this.form = {
        id: '',
        name: '',
        region: '',
        delivery: false,
        type: [],
        resource: '',
        desc: ''
      }
      // this.flowForm = {
      //   id: ''
      // }
    },
    handleClose() {
      this.drawerVisible = false
    },
    updateProperties(properties) {
      const modeling = this.modeler.get('modeling')
      modeling.updateProperties(this.element, properties)
    },
    saveTaskForm() {
      // this.updateProperties(this.form)
      // 放到documentation标签中
      const _this = this
      let documentations = _this.element.businessObject.get('documentation')
      documentations.push(this.bpmnFactory.create('bpmn:Documentation', {
        text: JSON.stringify(_this.form)
      }))
      this.handleClose()
    },
    cancel() {
      // console.log(this.form)
      this.elementRegistry = this.modeler.get('elementRegistry') // ! 获取所有元素集合
      console.log(this.elementRegistry)
    },
    saveFlowForm() {
      const _this = this
      const moddle = _this.modeler.get('moddle')
      const newCondition = moddle.create('bpmn:FormalExpression', {
        body: '${' + _this.flowForm.variable + _this.flowForm.operator + _this.flowForm.variableValue + '}'
      })
      const modeling = this.modeler.get('modeling')
      modeling.updateProperties(this.element, {
        conditionExpression: newCondition
      })
      this.handleClose()
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  padding: 30px 15px 15px 15px;
}
</style>
