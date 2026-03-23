import type { Rule } from 'eslint';

type BlockNode = Rule.Node & {
    body: Rule.Node[];
    loc: NonNullable<Rule.Node['loc']>;
};

export const noBlankLinesInBlocksRule: Rule.RuleModule = {
    meta: {
        type: 'suggestion',
        fixable: 'whitespace',
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
                    enableFix: {
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
        const enableFix = context.options[0]?.enableFix !== false;
        const getBlankLineRemovalRanges = (lines: number[]): Array<[number, number]> => {
            const ranges: Array<[number, number]> = [];
            for (const line of lines) {
                const lineText = sourceCode.lines[line - 1] ?? '';
                const lineStartIndex = sourceCode.getIndexFromLoc({ line, column: 0 });
                let lineEndIndex = lineStartIndex + lineText.length;
                const trailing = sourceCode.text.slice(lineEndIndex, lineEndIndex + 2);
                if (trailing === '\r\n') {
                    lineEndIndex += 2;
                } else {
                    const oneCharTrailing = sourceCode.text[lineEndIndex];
                    if (oneCharTrailing === '\n' || oneCharTrailing === '\r') {
                        lineEndIndex += 1;
                    }
                }
                ranges.push([lineStartIndex, lineEndIndex]);
            }
            return ranges;
        };
        const isCommentLine = (line: string): boolean => {
            const trimmed = line.trim();
            return trimmed.startsWith('//')
                || trimmed.startsWith('/*')
                || trimmed.startsWith('*')
                || trimmed.startsWith('*/');
        };
        const getOffendingBlankLinesBetween = (
            startLineInclusive: number,
            endLineInclusive: number,
        ): number[] => {
            if (endLineInclusive < startLineInclusive) {
                return [];
            }
            const blankLines: number[] = [];
            for (let line = startLineInclusive; line <= endLineInclusive; line += 1) {
                const lineText = sourceCode.lines[line - 1] ?? '';
                if (lineText.trim() === '') {
                    blankLines.push(line);
                }
            }
            if (blankLines.length === 0) {
                return [];
            }
            if (!allowSingleBlankLineBeforeComment || blankLines.length !== 1) {
                return blankLines;
            }
            const blankLine = blankLines[0];
            if (blankLine === endLineInclusive) {
                return blankLines;
            }
            // Allow exactly one blank line only when all following lines are comments.
            for (let line = blankLine + 1; line <= endLineInclusive; line += 1) {
                const lineText = sourceCode.lines[line - 1] ?? '';
                if (lineText.trim() !== '' && !isCommentLine(lineText)) {
                    return blankLines;
                }
            }
            // Require the blank line to be directly before the comment block.
            for (let line = startLineInclusive; line < blankLine; line += 1) {
                const lineText = sourceCode.lines[line - 1] ?? '';
                if (lineText.trim() !== '') {
                    return blankLines;
                }
            }
            return [];
        };
        const reportGap = (node: Rule.Node, offendingBlankLines: number[]): void => {
            const ranges = getBlankLineRemovalRanges(offendingBlankLines);
            context.report({
                node,
                messageId: 'noBlankLinesInBlock',
                fix(fixer) {
                    if (!enableFix) {
                        return null;
                    }
                    return ranges.map((range) => fixer.removeRange(range));
                },
            });
        };
        const checkBlockBody = (blockNode: BlockNode): void => {
            const statements = blockNode.body;
            if (statements.length === 0) {
                return;
            }
            const firstStatement = statements[0];
            const leadingGapOffenders = getOffendingBlankLinesBetween(
                blockNode.loc.start.line + 1,
                firstStatement.loc!.start.line - 1,
            );
            if (leadingGapOffenders.length > 0) {
                reportGap(blockNode, leadingGapOffenders);
                return;
            }
            for (let i = 1; i < statements.length; i += 1) {
                const previousStatement = statements[i - 1];
                const currentStatement = statements[i];
                const innerGapOffenders = getOffendingBlankLinesBetween(
                    previousStatement.loc!.end.line + 1,
                    currentStatement.loc!.start.line - 1,
                );
                if (innerGapOffenders.length > 0) {
                    reportGap(currentStatement, innerGapOffenders);
                    return;
                }
            }
            const lastStatement = statements[statements.length - 1];
            const trailingGapOffenders = getOffendingBlankLinesBetween(
                lastStatement.loc!.end.line + 1,
                blockNode.loc.end.line - 1,
            );
            if (trailingGapOffenders.length > 0) {
                reportGap(blockNode, trailingGapOffenders);
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
