'use strict'

const React = require('react')
const unified = require('unified')
const parse = require('remark-parse')
const remarkRehype = require('remark-rehype')
const filter = require('./rehype-filter')

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
  const asyncMode = options.asyncMode
  const children = options.children || ''
  const [hastNode, setHastNode] = React.useState(null)
  React.useEffect(() => {
    if (!asyncMode) {
      setHastNode(null)
      return
    }

    const processor = createProcessor(options)

    /** @type {Root} */
    // @ts-ignore we’ll throw if it isn’t a root next.
    processor
      .run(processor.parse(children))
      .then((node) => {
        setHastNode(node)
      })
      .catch((error) => {
        console.log('Markdown parsing error:', error.message)
      })
  }, [asyncMode, children])

  if (asyncMode) {
    return hastNode
  }

  const processor = createProcessor(options)
  /** @type {Root} */
  // @ts-ignore we’ll throw if it isn’t a root next.
  return processor.runSync(processor.parse(children))
}

function createProcessor(options) {
  return (
    unified()
      .use(parse)
      // TODO: deprecate `plugins` in v7.0.0.
      .use(options.remarkPlugins || options.plugins || [])
      .use(remarkRehype, {allowDangerousHtml: true})
      .use(options.rehypePlugins || [])
      .use(filter, options)
  )
}
