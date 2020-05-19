<template>
  <div v-show="nodeType === 'bpmn:StartEvent' && isTimerEvent">
    <div><span>ID：</span><span>{{ form.id }}</span></div>
    <el-link type="primary" :underline="false" @click="showDrawer">修改</el-link>
    <el-drawer
      :visible.sync="drawerVisible"
      :with-header="false"
      :before-close="handleClose">
      <div class="container">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="计时器类型" prop="timerType">
            <el-select v-model="form.timerType" placeholder="请选择计时器类型">
              <el-option label="timeDate" value="timeDate"></el-option>
              <el-option label="timeDuration" value="timeDuration"></el-option>
              <el-option label="timeCycle" value="timeCycle"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="计时器定义" prop="timerDefinition">
            <el-input v-model="form.timerDefinition"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveForm">保存</el-button>
            <el-button @click="cancel">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'StartEventPanel',
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
        timerType: '',
        timerDefinition: ''
      },
      element: {},
      bpmnFactory: null,
      isTimerEvent: false // 是否是定时启动事件
    }
  },
  mounted() {
    this.bpmnFactory = this.modeler.get('bpmnFactory')
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
        id: '',
        timerType: '',
        timerDefinition: ''
      }
    },
    /**
     * Get the timer definition type for a given timer event definition.
     *
     * @param {ModdleElement<bpmn:TimerEventDefinition>} timer
     *
     * @return {string|undefined} the timer definition type
     */
    getTimerDefinitionType(timer) {
      if (!timer) {
        return
      }
      const timeDate = timer.get('timeDate')
      if (typeof timeDate !== 'undefined') {
        return 'timeDate'
      }
      const timeCycle = timer.get('timeCycle')
      if (typeof timeCycle !== 'undefined') {
        return 'timeCycle'
      }
      const timeDuration = timer.get('timeDuration')
      if (typeof timeDuration !== 'undefined') {
        return 'timeDuration'
      }
    },
    modelerListener() {
      this.modeler.on('selection.changed', e => {
        const element = e.newSelection[0]
        if (!element) return
        this.element = element
        const eventDefinitions = element.businessObject.get('eventDefinitions')
        if (eventDefinitions && eventDefinitions.length > 0) {
          this.isTimerEvent = true
          const eventDefinition = eventDefinitions[0]
          const oldType = this.getTimerDefinitionType(eventDefinition)
          if (oldType) {
            const definition = eventDefinition.get(oldType)
            this.form.timerType = oldType
            this.form.timerDefinition = definition.get('body')
            this.form = {
              ...this.form,
              ...element.businessObject
            }
          } else {
            this.form = {
              ...this.form,
              ...element.businessObject
            }
          }
        }
      })
    },
    saveForm() {
      const _this = this
      // 获取businessObject下的eventDefinitions属性，其值为一个数组，数组成员是ModdleElement，类型为'bpmn:TimerEventDefinition'
      let eventDefinitions = _this.element.businessObject.get('eventDefinitions')
      // 创建一个类型为'bpmn:TimerEventDefinition'的ModdleElement
      let TimerEventDefinition = _this.bpmnFactory.create('bpmn:TimerEventDefinition')
      // 创建一个类型为'bpmn:FormalExpression'的ModdleElement，并指定其父元素
      let FormalExpression = this.bpmnFactory.create('bpmn:FormalExpression', { body: _this.form.timerDefinition })
      FormalExpression.$parent = TimerEventDefinition
      // 将FormalExpression指定为TimerEventDefinition的属性值，key就是选中的定时器类型（timeDate,timeDuration,timeCycle）
      TimerEventDefinition[_this.form.timerType] = FormalExpression
      // 无论是直接赋值还是push的方法，都无法使用后退功能
      // eventDefinitions.push(TimerEventDefinition)
      // 采用更新属性的方式，可以使用后退功能
      const modeling = this.modeler.get('modeling')
      modeling.updateProperties(this.element, {
        eventDefinitions: [TimerEventDefinition]
      })
      this.handleClose()
    },
    cancel() {}
  }
}
</script>

<style scoped lang="scss">
  .container {
    padding: 30px 15px 15px 15px;
  }
</style>
