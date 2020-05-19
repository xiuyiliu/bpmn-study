// 引入默认的renderer，让自定义的renderer继承它
import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer'
import { customElements, customConfig } from '../utils'
import {
  append as svgAppend,
  create as svgCreate
} from 'tiny-svg'
const HIGH_PRIORITY = 1500 // 最高优先级，一定要有，不然不会执行drawShape函数
export default class CustomRenderer extends BaseRenderer {
  constructor(eventBus, bpmnRenderer) {
    super(eventBus, HIGH_PRIORITY)
    this.bpmnRenderer = bpmnRenderer
  }
  canRender(element) {
    // ignore labels
    return !element.labelTarget
  }
  // 核心函数就是绘制shape
  drawShape(parentNode, element) {
    const type = element.type // 获取类型
    if (customElements.includes(type)) {
      const { url, attr } = customConfig[type]
      const customIcon = svgCreate('image', { // 在这里创建了一个image
        ...attr,
        href: url
      })
      element['width'] = attr.width
      element['height'] = attr.height
      svgAppend(parentNode, customIcon)
      return customIcon
    }
    const shape = this.bpmnRenderer.drawShape(parentNode, element)
    return shape
  }
  getShapePath(shape) {
    return this.bpmnRenderer.getShapePath(shape)
  }
}

CustomRenderer.$inject = ['eventBus', 'bpmnRenderer']
