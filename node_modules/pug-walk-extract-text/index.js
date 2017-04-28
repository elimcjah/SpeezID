'use strict'

var walk = require('pug-walk')

module.exports = function walkExtract (tree, text, shouldExtract, beforeCallback, afterCallback) {
	if (typeof beforeCallback !== 'function')
		beforeCallback = function (_, __) {}
	if (typeof afterCallback !== 'function')
		afterCallback = function (_, __) {}
	var results = []
	var textLines = text.split('\n')
	var inExtractableNode = false
	var curTextNodes = []
	walk(tree, function before (node, replace) {
		beforeCallback(node, replace)
		if (shouldExtract(node)) {
			inExtractableNode = true
			curTextNodes = []
		}
	}, function after (node, replace) {
		afterCallback(node, replace)
		if (shouldExtract(node)) {
			inExtractableNode = false
			if (curTextNodes.length < 1) return
			results.push({
				text: curTextNodes.map(function (node) { return node.val }).join(''),
				line: curTextNodes[0].line,
				indent: textLines[curTextNodes[0].line - 1].indexOf(curTextNodes[0].val.split('\n')[0]),
				node: node
			})
		}
		if (!inExtractableNode) return
		if (node.type === 'Text')
			curTextNodes.push(node)
	}, {includeDependencies: true})
	return results
}
