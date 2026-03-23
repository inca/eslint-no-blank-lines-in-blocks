# @inca/eslint-no-blank-lines-in-blocks

ESLint plugin rule that disallows blank lines inside method and function blocks.

## Why this rule

Blank lines inside small methods and functions are often a signal that logic is doing too much in one place. Among other things, this rule helps coding agents write more focused methods/functions and add meaningful structure instead of whitespace-based grouping.

## Install

```bash
npm install --save-dev @inca/eslint-no-blank-lines-in-blocks eslint
```

## Usage (Flat Config)

```js
import noBlankLinesInBlocks from '@inca/eslint-no-blank-lines-in-blocks';

export default [
    noBlankLinesInBlocks.configs.recommended,
];
```

Or configure manually:

```js
import noBlankLinesInBlocks from '@inca/eslint-no-blank-lines-in-blocks';

export default [
    {
        plugins: {
            '@inca/no-blank-lines-in-blocks': noBlankLinesInBlocks,
        },
        rules: {
            '@inca/no-blank-lines-in-blocks/no-blank-lines-in-blocks': 'error',
        },
    },
];
```

Optionally allow a single blank line before a comment block:

```js
import noBlankLinesInBlocks from '@inca/eslint-no-blank-lines-in-blocks';

export default [
    {
        plugins: {
            '@inca/no-blank-lines-in-blocks': noBlankLinesInBlocks,
        },
        rules: {
            '@inca/no-blank-lines-in-blocks/no-blank-lines-in-blocks': [
                'error',
                { allowSingleBlankLineBeforeComment: true },
            ],
        },
    },
];
```

You can also disable autofix while still reporting violations:

```js
import noBlankLinesInBlocks from '@inca/eslint-no-blank-lines-in-blocks';

export default [
    {
        plugins: {
            '@inca/no-blank-lines-in-blocks': noBlankLinesInBlocks,
        },
        rules: {
            '@inca/no-blank-lines-in-blocks/no-blank-lines-in-blocks': [
                'error',
                { enableFix: false },
            ],
        },
    },
];
```

## Examples

### Method

Invalid:

```ts
class Service {
    run(): void {
        const value = 1;

        console.log(value);
    }
}
```

Valid:

```ts
class Service {
    run(): void {
        const value = 1;
        console.log(value);
    }
}
```

### Function

Invalid:

```ts
function process(input: string): string {
    const normalized = input.trim();

    return normalized.toUpperCase();
}
```

Valid:

```ts
function process(input: string): string {
    const normalized = input.trim();
    return normalized.toUpperCase();
}
```
