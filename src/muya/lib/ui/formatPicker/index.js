import BaseFloat from '../baseFloat'
import { patch, h } from '../../parser/render/snabbdom'
import icons from './config'

import './index.css'

const defaultOptions = {
  placement: 'top',
  modifiers: {
    offset: {
      offset: '20, 5'
    }
  },
  showArrow: false
}

class FormatPicker extends BaseFloat {
  constructor (muya, options = {}) {
    const name = 'ag-format-picker'
    const opts = Object.assign({}, defaultOptions, options)
    super(muya, name, opts)
    this.oldVnode = null
    this.formats = null
    this.options = opts
    this.icons = icons
    const formatContainer = this.formatContainer = document.createElement('div')
    this.container.appendChild(formatContainer)
    this.listen()
  }

  listen () {
    const { eventCenter } = this.muya
    super.listen()
    eventCenter.subscribe('muya-format-picker', ({ reference, formats }) => {
      this.formats = formats
      setTimeout(() => {
        this.show(reference)
        this.render()
      }, 0)
    })
  }

  render () {
    const { icons, oldVnode, formatContainer, formats } = this
    const children = icons.map(i => {
      const icon = h('svg', {
        attrs: {
          'viewBox': i.icon.viewBox,
          'aria-hidden': 'true'
        }
      }, [h('use', {
        attrs: {
          'xlink:href': i.icon.url
        }
      })]
      )
      const iconWrapper = h('div.icon-wrapper', icon)
      let itemSelector = `li.item.${i.type}`
      if (formats.some(f => f.type === i.type)) {
        itemSelector += '.active'
      }
      return h(itemSelector, {
        on: {
          click: event => {
            this.selectItem(event, i)
          }
        }
      }, iconWrapper)
    })

    const vnode = h('ul', children)

    if (oldVnode) {
      patch(oldVnode, vnode)
    } else {
      patch(formatContainer, vnode)
    }
    this.oldVnode = vnode
  }

  selectItem (event, item) {
    event.preventDefault()
    event.stopPropagation()
    const { contentState } = this.muya
    contentState.render()
    contentState.format(item.type)
    const { formats } = contentState.selectionFormats()
    this.formats = formats
    this.render()
  }
}

export default FormatPicker