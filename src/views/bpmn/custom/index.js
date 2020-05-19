// 所有自定义的东西都需要在这里统一导出，_init__中的名字无论是自定义扩展还是完全自定义名字都是固定的，需要按照要求的来
import CustomPalette from './custom-palette/CustomPalette'
import CustomRenderer from './custom-renderer/CustomRenderer'
import CustomContextPad from './custom-context-pad/CustomContextPad'
// 这里__init__中的名字就必须是customPalette了, 还有下面的属性名也必须是customPalette, 不然就会报错了.
export default {
  __init__: ['customPalette', 'customRenderer', 'customContextPad'],
  customPalette: ['type', CustomPalette],
  customRenderer: ['type', CustomRenderer],
  customContextPad: ['type', CustomContextPad]
}
