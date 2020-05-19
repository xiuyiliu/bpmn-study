export default class CustomContextPad {
  constructor(config, contextPad, create, elementFactory, injector, translate) {
    this.create = create
    this.elementFactory = elementFactory
    this.translate = translate
    if (config.autoPlace !== false) {
      this.autoPlace = injector.get('autoPlace', false)
    }
    contextPad.registerProvider(this) // 定义这是一个contextPad
  }
  // 这个函数就是自定义的核心
  getContextPadEntries(element) {
    const {
      autoPlace,
      create,
      elementFactory,
      translate
    } = this
    function appendTask(event, element) {
      if (autoPlace) {
        const shape = elementFactory.createShape({ type: 'bpmn:Task' });
        autoPlace.append(element, shape);
      } else {
        appendTaskStart(event, element);
      }
    }

    function appendTaskStart(event) {
      const shape = elementFactory.createShape({ type: 'bpmn:Task' });
      create.start(event, shape, element);
    }
    return {
      'append.delay-task': {
        group: 'model',
        className: 'icon-custom delay-task',
        title: translate('创建一个类型为delay-task的任务节点'),
        action: {
          click: appendTask,
          dragstart: appendTaskStart
        }
      }
    }
  }
}

CustomContextPad.$inject = [
  'config',
  'contextPad',
  'create',
  'elementFactory',
  'injector',
  'translate'
]
