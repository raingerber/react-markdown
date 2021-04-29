'use strict'

const unified = require('unified')
const parse = require('remark-parse')
const remarkRehype = require('remark-rehype')
const filter = require('./rehype-filter')

module.exports = {
  parseSync,
  parseAsync
}

function parseSync(options) {
  const processor = createProcessor(options)
  try {
    return processor.runSync(processor.parse(options.children || ''))
  } catch (error) {
    return getErrorFallback(options, error)
  }
}

function parseAsync(options) {
  const processor = createProcessor(options)
  return processor
    .run(processor.parse(options.children || ''))
    .catch((error) => {
      return getErrorFallback(options, error)
    })
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

function getErrorFallback(options, error) {
  return (options.renderOnError && options.renderOnError(error)) || null
}
