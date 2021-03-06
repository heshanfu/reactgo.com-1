'use strict'

var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

var _asyncToGenerator2 = _interopRequireDefault(
  require('@babel/runtime/helpers/asyncToGenerator')
)

const grayMatter = require(`gray-matter`)

const crypto = require(`crypto`)

const _ = require(`lodash`)

module.exports =
  /*#__PURE__*/
  (function() {
    var _onCreateNode = (0, _asyncToGenerator2.default)(function*(
      { node, getNode, loadNodeContent, actions, createNodeId },
      pluginOptions
    ) {
      const createNode = actions.createNode,
        createParentChildLink = actions.createParentChildLink // We only care about markdown content.

      if (
        node.internal.mediaType !== `text/markdown` &&
        node.internal.mediaType !== `text/x-markdown`
      ) {
        return
      }

      const content = yield loadNodeContent(node)
      let data = grayMatter(content, pluginOptions) // Convert date objects to string. Otherwise there's type mismatches
      // during inference as some dates are strings and others date objects.

      if (data.data) {
        data.data = _.mapValues(data.data, v => {
          if (_.isDate(v)) {
            return v.toJSON()
          } else {
            return v
          }
        })
      }

      const markdownNode = {
        id: createNodeId(`${node.id} >>> MarkdownRemark`),
        modifiedTime: `${node.modifiedTime}`,
        accessTime: `${node.accessTime}`,
        changeTime: `${node.changeTime}`,
        birthTime: `${node.birthTime}`,
        children: [],
        parent: node.id,
        internal: {
          content: data.content,
          type: `MarkdownRemark`,
        },
      }
      markdownNode.frontmatter = Object.assign(
        {
          title: ``,
        },
        data.data,
        {
          _PARENT: node.id,
        }
      )
      markdownNode.excerpt = data.excerpt
      markdownNode.rawMarkdownBody = data.content // Add path to the markdown file path

      if (node.internal.type === `File`) {
        markdownNode.fileAbsolutePath = node.absolutePath
      }

      markdownNode.internal.contentDigest = crypto
        .createHash(`md5`)
        .update(JSON.stringify(markdownNode))
        .digest(`hex`)
      createNode(markdownNode)
      createParentChildLink({
        parent: node,
        child: markdownNode,
      })
    })

    return function onCreateNode(_x, _x2) {
      return _onCreateNode.apply(this, arguments)
    }
  })()
