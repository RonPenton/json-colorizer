import chalk from 'chalk';
import { get } from 'lodash';

const defaultColors = {
    BRACE: 'gray',
    BRACKET: 'gray',
    COLON: 'gray',
    COMMA: 'gray',
    STRING_KEY: 'magenta',
    STRING_LITERAL: 'yellow',
    NUMBER_LITERAL: 'green',
    BOOLEAN_LITERAL: 'cyan',
    NULL_LITERAL: 'white'
};

type Token =
    | 'BRACE'
    | 'BRACKET'
    | 'COLON'
    | 'COMMA'
    | 'STRING_KEY'
    | 'STRING_LITERAL'
    | 'NUMBER_LITERAL'
    | 'BOOLEAN_LITERAL'
    | 'NULL_LITERAL';

type CustomColorer = (key: string, value: any, parent: object) => string | null | undefined;

export interface Options {
    colors?: {
        [token in Token]?: string;
    } & {
        CUSTOM?: CustomColorer;
    }
}

type Primitive = string | number | boolean | null;

export function colorize(json: unknown, options: Options = {}) {
    const seen = new WeakSet();
    options.colors = options.colors ?? {};
    const colors = { ...defaultColors, ...options.colors };

    function recurse(node: unknown) {
        if (Array.isArray(node))
            return renderArray(node);
        if (isPrimitive(node))
            return renderPrimitive(node);
        if (typeof node === 'object' && node != null) {
            if (seen.has(node)) {
                return '"{REPLACED CIRCULAR REFERENCE}"';
            }
            seen.add(node);
            return renderObject(node);
        }
        return 'null';
    }

    function renderPrimitive(node: Primitive) {
        if (typeof node === 'string') {
            return color(JSON.stringify(node), 'STRING_LITERAL');
        }
        else if (typeof node === 'number') {
            return color(JSON.stringify(node), 'NUMBER_LITERAL');
        }
        else if (typeof node === 'boolean') {
            return color(JSON.stringify(node), 'BOOLEAN_LITERAL');
        }
        else {
            return color('null', 'NULL_LITERAL');
        }
    }

    function renderKey(key: string) {
        return color(JSON.stringify(key), 'STRING_KEY');
    }

    function renderObject(node: any): string {
        const keys = Object.keys(node);
        const items = keys.map(x => `${renderKey(x)}${color(': ', 'COLON')}${renderChild(x, node[x], node)}`);
        const combined = items.join(color(', ', 'COMMA'));
        const final = `${color('{', 'BRACE')}${combined}${color('}', 'BRACE')}`;
        return final;
    }

    function renderChild(key: string, value: any, parent: object) {
        if (colors.CUSTOM) {
            const colorKey = colors.CUSTOM(key, value, parent);
            if (colorKey) {
                return colorChalk(JSON.stringify(value, getCircularReplacer()), colorKey);
            }
        }

        return recurse(value);
    }

    function renderArray(node: (object | Primitive)[]): string {
        const items = node.map(x => recurse(x));
        const combined = items.join(color(', ', 'COMMA'));
        const final = `${color('[', 'BRACKET')}${combined}${color(']', 'BRACKET')}`;
        return final;
    }

    function color(value: string, token: Token) {
        const colorKey = colors[token] || defaultColors[token];
        return colorChalk(value, colorKey);
    }

    return recurse(json);
}

function colorChalk(value: string, colorKey?: string | null) {
    if (!colorKey)
        return value;

    const colorFn = colorKey && colorKey[0] === '#' ? chalk.hex(colorKey) : get(chalk, colorKey);
    return colorFn ? colorFn(value) : value;
}

function isPrimitive(node: any): node is Primitive {
    return typeof node === 'string' || typeof node === 'boolean' || typeof node === 'number' || node === null || node === undefined;
}

const getCircularReplacer = () => {
    const seen = new WeakSet();
    return (_key: any, value: any) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return;
            }
            seen.add(value);
        }
        return value;
    };
};
