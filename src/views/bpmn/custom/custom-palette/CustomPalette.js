// CustomPalette.js
export default class CustomPalette {
  constructor(bpmnFactory, create, elementFactory, palette, translate) {
    this.bpmnFactory = bpmnFactory
    this.create = create
    this.elementFactory = elementFactory
    this.translate = translate
    // 指定这是一个palette
    palette.registerProvider(this)
  }
  // 这个函数就是绘制palette的核心
  getPaletteEntries(element) {
    const { bpmnFactory, create, elementFactory, translate } = this
    // 编写一个函数用来创建bpmn:Task这个元素
    function createTask() {
      return function(event) {
        const businessObject = bpmnFactory.create('bpmn:Task')
        const shape = elementFactory.createShape({
          type: 'bpmn:Task',
          businessObject
        })
        create.start(event, shape)
      }
    }
    // 返回一个对象，对象中指定的就是你要自定义的项
    return {
      'create.delay-task': {
        group: 'model',
        className: 'bpmn-icon-task red', // 样式类名
        title: translate('创建一个类型为delay-task的任务节点'),
        action: {
          dragstart: createTask(), // 开始拖拽时调用的事件
          click: createTask() // 点击时调用的事件
        }
      }
    }
  }
}

CustomPalette.$inject = [
  'bpmnFactory',
  'create',
  'elementFactory',
  'palette',
  'translate'
]
