const { rules } = require('@typescript-eslint/eslint-plugin')

/**
 * Custom ESLint rule to detect improper use of Reanimated scroll handlers
 * Catches cases where useAnimatedScrollHandler is passed to standard FlatList
 */
const noInvalidReanimatedScrollHandler = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow passing useAnimatedScrollHandler result to standard FlatList onScroll',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidScrollHandler:
        "useAnimatedScrollHandler returns an object and must be used with Animated.FlatList from 'react-native-reanimated', not standard FlatList from 'react-native'.",
    },
  },
  create(context) {
    return {
      // Check JSXAttribute onScroll
      JSXAttribute(node) {
        if (node.name.name !== 'onScroll') return

        // Get the parent element name
        const jsxElement = node.parent
        if (!jsxElement || jsxElement.type !== 'JSXOpeningElement') return

        const elementName = jsxElement.name
        let elementNameStr = ''

        if (elementName.type === 'JSXIdentifier') {
          elementNameStr = elementName.name
        } else if (elementName.type === 'JSXMemberExpression') {
          // Handle cases like <Animated.FlatList />
          const parts = []
          let current = elementName
          while (current) {
            if (current.type === 'JSXIdentifier') {
              parts.unshift(current.name)
              break
            }
            if (current.type === 'JSXMemberExpression') {
              parts.unshift(current.property.name)
              current = current.object
            } else {
              break
            }
          }
          elementNameStr = parts.join('.')
        }

        // Check if it's a FlatList (but not Animated.FlatList)
        const isFlatList =
          elementNameStr === 'FlatList' ||
          (elementNameStr.includes('FlatList') && !elementNameStr.startsWith('Animated.'))

        if (!isFlatList) return

        // Check if the value is useAnimatedScrollHandler
        const value = node.value
        if (!value) return

        let isAnimatedHandler = false

        if (value.type === 'JSXExpressionContainer') {
          const expression = value.expression

          // Check if it's a call to useAnimatedScrollHandler
          if (
            expression.type === 'CallExpression' &&
            expression.callee.type === 'Identifier' &&
            expression.callee.name === 'useAnimatedScrollHandler'
          ) {
            isAnimatedHandler = true
          }

          // Check if it's an identifier that's likely a scrollHandler
          if (
            expression.type === 'Identifier' &&
            (expression.name.includes('scrollHandler') || expression.name.includes('ScrollHandler'))
          ) {
            // Check if this identifier was assigned from useAnimatedScrollHandler
            const scope = context.getScope()
            const variable = findVariable(scope, expression.name)

            if (variable && variable.defs.length > 0) {
              const def = variable.defs[0]
              if (
                def.node.type === 'VariableDeclarator' &&
                def.node.init &&
                def.node.init.type === 'CallExpression' &&
                def.node.init.callee.type === 'Identifier' &&
                def.node.init.callee.name === 'useAnimatedScrollHandler'
              ) {
                isAnimatedHandler = true
              }
            }
          }
        }

        if (isAnimatedHandler) {
          context.report({
            node,
            messageId: 'invalidScrollHandler',
          })
        }
      },
    }
  },
}

// Helper to find variable in scope
function findVariable(scope, name) {
  let currentScope = scope
  while (currentScope) {
    const variable = currentScope.variables.find((v) => v.name === name)
    if (variable) return variable
    currentScope = currentScope.upper
  }
  return null
}

module.exports = {
  rules: {
    'no-invalid-reanimated-scroll-handler': noInvalidReanimatedScrollHandler,
  },
}
