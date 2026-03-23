import type { Rule } from 'eslint';

const noBlankLinesInBlocksRule: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow blank lines in method and function blocks.',
        },
        schema: [],
        messages: {
            noBlankLinesInBlock: 'Do not add blank lines in method or function blocks.',
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;

        const hasBlankLineBetween = (startLineInclusive: number, endLineInclusive: number): boolean => {
            for (let line = startLineInclusive; line <= endLineInclusive; line += 1) {
                const lineText = sourceCode.lines[line - 1] ?? '';
                if (lineText.trim() === '') {
                    return true;
                }
            }
            return false;
        };

        const checkBlockBody = (reportNode: Rule.Node, blockNode: Rule.Node & { body: Rule.Node[]; loc: NonNullable<Rule.Node['loc']> }): void => {
            const statements = blockNode.body;
            if (statements.length === 0) {
                return;
            }

            const firstStatement = statements[0];
            if (hasBlankLineBetween(blockNode.loc.start.line + 1, firstStatement.loc!.start.line - 1)) {
                context.report({
                    node: reportNode,
                    messageId: 'noBlankLinesInBlock',
                });
                return;
            }

            for (let i = 1; i < statements.length; i += 1) {
                const previousStatement = statements[i - 1];
                const currentStatement = statements[i];
                if (hasBlankLineBetween(previousStatement.loc!.end.line + 1, currentStatement.loc!.start.line - 1)) {
                    context.report({
                        node: currentStatement,
                        messageId: 'noBlankLinesInBlock',
                    });
                    return;
                }
            }

            const lastStatement = statements[statements.length - 1];
            if (hasBlankLineBetween(lastStatement.loc!.end.line + 1, blockNode.loc.end.line - 1)) {
                context.report({
                    node: reportNode,
                    messageId: 'noBlankLinesInBlock',
                });
            }
        };

        return {
            MethodDefinition(node) {
                if (node.value?.body?.type === 'BlockStatement') {
                    checkBlockBody(node, node.value.body as Rule.Node & { body: Rule.Node[]; loc: NonNullable<Rule.Node['loc']> });
                }
            },
            Property(node) {
                const maybeFunctionValue = node.value as { body?: Rule.Node & { body?: Rule.Node[]; loc?: Rule.Node['loc']; type?: string } };
                if (node.method === true && maybeFunctionValue.body?.type === 'BlockStatement') {
                    checkBlockBody(node, maybeFunctionValue.body as Rule.Node & { body: Rule.Node[]; loc: NonNullable<Rule.Node['loc']> });
                }
            },
            FunctionDeclaration(node) {
                if (node.body?.type === 'BlockStatement') {
                    checkBlockBody(node, node.body as Rule.Node & { body: Rule.Node[]; loc: NonNullable<Rule.Node['loc']> });
                }
            },
            FunctionExpression(node) {
                if (node.body?.type === 'BlockStatement') {
                    checkBlockBody(node, node.body as Rule.Node & { body: Rule.Node[]; loc: NonNullable<Rule.Node['loc']> });
                }
            },
            ArrowFunctionExpression(node) {
                if (node.body?.type === 'BlockStatement') {
                    checkBlockBody(node, node.body as Rule.Node & { body: Rule.Node[]; loc: NonNullable<Rule.Node['loc']> });
                }
            },
        };
    },
};

export { noBlankLinesInBlocksRule };
