import type { ESLint } from 'eslint';
import { noBlankLinesInBlocksRule } from './rules/no-blank-lines-in-blocks.js';

const plugin: ESLint.Plugin = {
    meta: {
        name: '@inca/eslint-no-blank-lines-in-blocks',
        version: '1.0.0',
    },
    rules: {
        'no-blank-lines-in-blocks': noBlankLinesInBlocksRule,
    },
    configs: {
        recommended: {
            plugins: {},
            rules: {
                '@inca/no-blank-lines-in-blocks/no-blank-lines-in-blocks': 'error',
            },
        },
    },
};

plugin.configs = plugin.configs ?? {};
plugin.configs.recommended = {
    plugins: {
        '@inca/no-blank-lines-in-blocks': plugin,
    },
    rules: {
        '@inca/no-blank-lines-in-blocks/no-blank-lines-in-blocks': 'error',
    },
};

export default plugin;
export { noBlankLinesInBlocksRule };
