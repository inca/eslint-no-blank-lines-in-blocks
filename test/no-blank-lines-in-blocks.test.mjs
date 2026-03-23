import assert from 'node:assert/strict';
import mocha from 'mocha';
import { lint, ruleName } from './setup.mjs';

const { describe, it } = mocha;

describe('no-blank-lines-in-blocks rule', () => {
    describe('JavaScript', () => {
        describe('valid code', () => {
            it('passes linting', async () => {
                const code = `function run() {
    const first = 1;
    const second = first + 1;
    return second;
}`;
                const result = await lint({ code, filePath: 'valid.js' });
                assert.equal(result.errorCount, 0);
            });
        });
        describe('invalid code', () => {
            describe('without comment', () => {
                it('fails linting', async () => {
                    const code = `function run() {
    const first = 1;

    const second = first + 1;
    return second;
}`;
                    const result = await lint({ code, filePath: 'invalid-no-comment.js' });
                    assert.equal(result.errorCount, 1);
                    assert.equal(result.messages[0]?.ruleId, ruleName);
                });
            });
            describe('with comment', () => {
                it('fails linting', async () => {
                    const code = `function run() {
    const first = 1;

    // descriptive comment
    const second = first + 1;
    return second;
}`;
                    const result = await lint({ code, filePath: 'invalid-with-comment.js' });
                    assert.equal(result.errorCount, 1);
                    assert.equal(result.messages[0]?.ruleId, ruleName);
                });
            });
        });
        describe('autofix', () => {
            it('removes blank lines inside blocks', async () => {
                const code = `function run() {
    const first = 1;

    const second = first + 1;
    return second;
}`;
                const result = await lint({
                    code,
                    filePath: 'fix.js',
                    fix: true,
                });
                assert.equal(result.errorCount, 0);
                assert.equal(
                    result.output,
                    `function run() {
    const first = 1;
    const second = first + 1;
    return second;
}`,
                );
            });
        });
    });
    describe('TypeScript', () => {
        describe('valid code', () => {
            it('passes linting', async () => {
                const code = `function run(value: number): number {
    const first = value + 1;
    return first;
}`;
                const result = await lint({ code, filePath: 'valid.ts' });
                assert.equal(result.errorCount, 0);
            });
        });
        describe('autofix', () => {
            it('removes blank lines inside blocks', async () => {
                const code = `function run(value: number): number {
    const first = value + 1;

    return first;
}`;
                const result = await lint({
                    code,
                    filePath: 'fix.ts',
                    fix: true,
                });
                assert.equal(result.errorCount, 0);
                assert.equal(
                    result.output,
                    `function run(value: number): number {
    const first = value + 1;
    return first;
}`,
                );
            });
        });
    });
});
