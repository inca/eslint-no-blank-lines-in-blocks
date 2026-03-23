import type { Rule } from 'eslint';

type BlockNode = Rule.Node & {
    body: Rule.Node[];
    loc: NonNullable<Rule.Node['loc']>;
};

export const noBlankLinesInBlocksRule: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'Disallow blank lines inside code blocks.',
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
            noBlankLinesInBlock: 'Blank lines are not allowed in blocks; '
                + 'this often signals mixed responsibilities, '
                + 'so extract logically independent steps.',
        },
    },
    create(context) {
        const sourceCode = context.sourceCode;
        const allowSingleBlankLineBeforeComment =
            context.options[0]?.allowSingleBlankLineBeforeComment === true;
        const isCommentLine = (line: string): boolean => {
            const trimmed = line.trim();
            return trimmed.startsWith('//')
                || trimmed.startsWith('/*');
        };
        const hasDisallowedBlankLineBetween = (
            startLineInclusive: number,
            endLineInclusive: number,
        ): boolean => {
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
        const checkBlockBody = (blockNode: BlockNode): void => {
            const statements = blockNode.body;
            if (statements.length === 0) {
                return;
            }
            const firstStatement = statements[0];
            const hasLeadingGap = hasDisallowedBlankLineBetween(
                blockNode.loc.start.line + 1,
                firstStatement.loc!.start.line - 1,
            );
            if (hasLeadingGap) {
                context.report({
                    node: blockNode,
                    messageId: 'noBlankLinesInBlock',
                });
                return;
            }
            for (let i = 1; i < statements.length; i += 1) {
                const previousStatement = statements[i - 1];
                const currentStatement = statements[i];
                const hasInnerGap = hasDisallowedBlankLineBetween(
                    previousStatement.loc!.end.line + 1,
                    currentStatement.loc!.start.line - 1,
                );
                if (hasInnerGap) {
                    context.report({
                        node: currentStatement,
                        messageId: 'noBlankLinesInBlock',
                    });
                    return;
                }
            }
            const lastStatement = statements[statements.length - 1];
            const hasTrailingGap = hasDisallowedBlankLineBetween(
                lastStatement.loc!.end.line + 1,
                blockNode.loc.end.line - 1,
            );
            if (hasTrailingGap) {
                context.report({
                    node: blockNode,
                    messageId: 'noBlankLinesInBlock',
                });
            }
        };
        return {
            BlockStatement(node) {
                const blockNode = node as unknown as BlockNode;
                if (Array.isArray(blockNode.body) && blockNode.loc != null) {
                    checkBlockBody(blockNode);
                }
            },
        };
    },
};
