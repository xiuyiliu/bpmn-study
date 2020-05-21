import CustomPaletteProvider from './CustomPaletteProvider'
import PaletteModule from './CustomPalette'

export default {
  __depends__: [
    PaletteModule
  ],
  __init__: ['paletteProvider'],
  paletteProvider: ['type', CustomPaletteProvider]
}
