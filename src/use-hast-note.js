'use strict'

const React = require('react')
const Parser = require('./parser')

module.exports = useHastNode

/**
 * @typedef {import('react').ReactNode} ReactNode
 * @typedef {import('react').ReactElement<{}>} ReactElement
 * @typedef {import('unified').PluggableList} PluggableList
 * @typedef {import('hast').Root} Root
 * @typedef {import('./rehype-filter.js').RehypeFilterOptions} FilterOptions
 * @typedef {import('./ast-to-react.js').TransformOptions} TransformOptions
 *
 * @typedef {Object} CoreOptions
 * @property {string} children
 *
 * @typedef {Object} PluginOptions
 * @property {PluggableList} [plugins=[]] **deprecated**: use `remarkPlugins` instead
 * @property {PluggableList} [remarkPlugins=[]]
 * @property {PluggableList} [rehypePlugins=[]]
 *
 * @typedef {Object} LayoutOptions
 * @property {string} [className]
 *
 * @typedef {CoreOptions & PluginOptions & LayoutOptions & FilterOptions & TransformOptions} ReactMarkdownOptions
 */

function useHastNode(options) {
  const nodeRef = React.useRef()
  const [, render] = React.useState(0)
  const asyncMode = options.asyncMode
  React.useEffect(() => {
    if (!asyncMode) {
      return
    }
    let isCancelled = false
    Parser.parseAsync(options).then((hastNode) => {
      if (isCancelled) {
        return
      }
      nodeRef.current = hastNode
      render((c) => c + 1)
    })
    return () => ((isCancelled = true), void 0)
  }, [options.children])

  if (asyncMode) {
    return nodeRef.current
  }
  nodeRef.current = Parser.parseSync(options)
  return nodeRef.current
}
