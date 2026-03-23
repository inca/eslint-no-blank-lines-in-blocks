import type { Rule } from 'eslint';

export const noBlankLinesInBlocksRule: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow blank lines in method and function blocks.',
        },
        schema: [
            {
                type: 'object',
                properties: {
                    allowSingleBlankLineBeforeComment: {
                        type: 'boolean',
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            noBlankLinesInBlock: 'Blank lines are not allowed in method/function blocks; this often signals mixed responsibilities, so extract logically independent steps.',
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;
        const allowSingleBlankLineBeforeComment = context.options[0]?.allowSingleBlankLineBeforeComment === true;
        const isCommentLine = (line: string): boolean => {
            const trimmed = line.trim();
            return trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('*/');
        };
        const hasDisallowedBlankLineBetween = (startLineInclusive: number, endLineInclusive: number): boolean => {
            if (endLineInclusive < startLineInclusive) {
                return false;
            }
            const blankLines: number[] = [];
            for (let line = startLineInclusive; line <= endLineInclusive; line += 1) {
                const lineText = sourceCode.lines[line - 1] ?? '';
                if (lineText.trim() === '') {
                    blankLines.push(line);
                }
            }
            if (blankLines.length === 0) {
                return false;
            }
            if (!allowSingleBlankLineBeforeComment || blankLines.length !== 1) {
                return true;
            }
            const blankLine = blankLines[0];
            if (blankLine === endLineInclusive) {
                return true;
            }
            // Allow exactly one blank line only when all following lines are comments.
            for (let line = blankLine + 1; line <= endLineInclusive; line += 1) {
                const lineText = sourceCode.lines[line - 1] ?? '';
                if (lineText.trim() !== '' && !isCommentLine(lineText)) {
                    return true;
                }
            }
            // Require the blank line to be directly before the comment block.
            for (let line = startLineInclusive; line < blankLine; line += 1) {
                const lineText = sourceCode.lines[line - 1] ?? '';
                if (lineText.trim() !== '') {
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
            if (hasDisallowedBlankLineBetween(blockNode.loc.start.line + 1, firstStatement.loc!.start.line - 1)) {
                context.report({
                    node: reportNode,
                    messageId: 'noBlankLinesInBlock',
                });
                return;
            }
            for (let i = 1; i < statements.length; i += 1) {
                const previousStatement = statements[i - 1];
                const currentStatement = statements[i];
                if (hasDisallowedBlankLineBetween(previousStatement.loc!.end.line + 1, currentStatement.loc!.start.line - 1)) {
                    context.report({
                        node: currentStatement,
                        messageId: 'noBlankLinesInBlock',
                    });
                    return;
                }
            }
            const lastStatement = statements[statements.length - 1];
            if (hasDisallowedBlankLineBetween(lastStatement.loc!.end.line + 1, blockNode.loc.end.line - 1)) {
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
