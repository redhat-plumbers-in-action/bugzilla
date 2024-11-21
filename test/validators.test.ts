import { Settings } from 'luxon';
import { expect, test } from 'vitest';

import {
  boolean,
  int,
  double,
  string,
  datetime,
  nullable,
  optional,
  object,
  array,
  maybeArray,
  intString,
  map,
  either,
  base64,
} from '../src/validators';

// Force all times to UTC.
Settings.defaultZone = 'UTC';

test('boolean', () => {
  expect(boolean(false)).toBe(false);
  expect(boolean(true)).toBe(true);

  expect(() => boolean(null)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a boolean but received \`null\`]`
  );
  expect(() => boolean(undefined)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a boolean but received \`undefined\`]`
  );
  expect(() => boolean(0)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a boolean but received \`0\`]`
  );
  expect(() => boolean('')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a boolean but received \`""\`]`
  );
  expect(() => boolean([])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a boolean but received \`[]\`]`
  );
  expect(() => boolean([false])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a boolean but received \`[false]\`]`
  );
});

test('int', () => {
  expect(int(0)).toBe(0);
  expect(int(1)).toBe(1);
  expect(int(-1)).toBe(-1);
  expect(int(10)).toBe(10);
  expect(int(20)).toBe(20);

  // TODO: int should fail on non-integers.
  expect(int(20.5)).toBe(20.5);

  expect(() => int(null)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`null\`]`
  );
  expect(() => int(undefined)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`undefined\`]`
  );
  expect(() => int('5')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`"5"\`]`
  );
  expect(() => int('0')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`"0"\`]`
  );
  expect(() => int([])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`[]\`]`
  );
  expect(() => int([0])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`[0]\`]`
  );
});

test('double', () => {
  expect(double(0)).toBe(0);
  expect(double(0.1)).toBe(0.1);
  expect(double(-0.1)).toBe(-0.1);
  expect(double(10.3)).toBe(10.3);
  expect(double(20)).toBe(20);
  expect(double(20.5)).toBe(20.5);

  expect(() => double(null)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`null\`]`
  );
  expect(() => double(undefined)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`undefined\`]`
  );
  expect(() => double('5')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`"5"\`]`
  );
  expect(() => double('0')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`"0"\`]`
  );
  expect(() => double([])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`[]\`]`
  );
  expect(() => double([0])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`[0]\`]`
  );
});

test('string', () => {
  expect(string('')).toBe('');
  expect(string('foo')).toBe('foo');

  expect(() => string(null)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a string but received \`null\`]`
  );
  expect(() => string(undefined)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a string but received \`undefined\`]`
  );
  expect(() => string(0)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a string but received \`0\`]`
  );
  expect(() => string([])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a string but received \`[]\`]`
  );
  expect(() => string([''])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a string but received \`[""]\`]`
  );
});

test('optional', () => {
  expect(optional(int)(5)).toBe(5);
  expect(optional(int)(undefined)).toBe(undefined);
  expect(optional(int, 5)(undefined)).toBe(5);

  expect(() => optional(int)(null)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`null\`]`
  );
  expect(() => optional(int, 5)(null)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`null\`]`
  );
  expect(() => optional(int)('4')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`"4"\`]`
  );
});

test('nullable', () => {
  expect(nullable(int)(5)).toBe(5);
  expect(nullable(int)(null)).toBe(null);
  expect(nullable(int, 5)(null)).toBe(5);

  expect(() => nullable(int)(undefined)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`undefined\`]`
  );
  expect(() => nullable(int, 5)(undefined)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`undefined\`]`
  );
  expect(() => nullable(int)('4')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a number but received \`"4"\`]`
  );
});

test('datetime', () => {
  expect(datetime('2022-01-12T05:43:27Z').toISO()).toBe(
    '2022-01-12T05:43:27.000Z'
  );

  expect(() => datetime(5)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an ISO-8601 string but received \`5\`]`
  );
  expect(() => datetime(null)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an ISO-8601 string but received \`null\`]`
  );
  expect(() => datetime(undefined)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an ISO-8601 string but received \`undefined\`]`
  );
  expect(() => datetime('foo')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an ISO-8601 string but received \`"foo"\`]`
  );
  expect(() =>
    datetime('2022-15-12T05:43:27Z')
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an ISO-8601 string but received \`"2022-15-12T05:43:27Z"\`]`
  );
});

test('object', () => {
  expect(object({ str: string })({ str: '5' })).toEqual({ str: '5' });
  expect(object({ num: int })({ num: 5 })).toEqual({ num: 5 });
  expect(object({ str: string, num: int })({ str: '5', num: 5 })).toEqual({
    str: '5',
    num: 5,
  });
  expect(object({ str: string })({ str: '5', num: 5 })).toEqual({
    str: '5',
  });

  expect(() =>
    object({ str: string, num: int })({ str: 5, num: '5' })
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Error validating field 'str': Expected a string but received \`5\`]`
  );
  expect(() =>
    object({ str: string })(null)
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an object but received \`null\`]`
  );
  expect(() =>
    object({ str: string })(undefined)
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an object but received \`undefined\`]`
  );
});

test('array', () => {
  expect(array(string)([])).toEqual([]);
  expect(array(string)(['5'])).toEqual(['5']);
  expect(array(string)(['hello', 'foo', '5'])).toEqual(['hello', 'foo', '5']);
  expect(array(int)([5, 3, 7])).toEqual([5, 3, 7]);

  expect(() => array(string)(null)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an array but received \`null\`]`
  );
  expect(() => array(string)(undefined)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an array but received \`undefined\`]`
  );
  expect(() => array(string)('hello')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an array but received \`"hello"\`]`
  );
  expect(() => array(int)(5)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an array but received \`5\`]`
  );
  expect(() =>
    array(string)(['foo', 'bar', 6])
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Error validating array: Expected a string but received \`6\`]`
  );
});

test('maybeArray', () => {
  expect(maybeArray(string)('5')).toBe('5');
  expect(maybeArray(string)(['5', 'foo'])).toEqual(['5', 'foo']);
  expect(maybeArray(string)([])).toEqual([]);

  expect(() => maybeArray(string)(5)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a string but received \`5\`]`
  );
  expect(() => maybeArray(string)(null)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a string but received \`null\`]`
  );
  expect(() =>
    maybeArray(string)(undefined)
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a string but received \`undefined\`]`
  );
  expect(() => maybeArray(string)([5])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Error validating array: Expected a string but received \`5\`]`
  );
  expect(() =>
    maybeArray(string)(['foo', 5])
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Error validating array: Expected a string but received \`5\`]`
  );
});

test('intString', () => {
  expect(intString('5')).toBe(5);

  expect(() => intString('')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an integer as a string but received \`""\`]`
  );
  expect(() => intString(null)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an integer as a string but received \`null\`]`
  );
  expect(() => intString(undefined)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an integer as a string but received \`undefined\`]`
  );
  expect(() => intString(0)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an integer as a string but received \`0\`]`
  );
  expect(() => intString([])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an integer as a string but received \`[]\`]`
  );
  expect(() => intString([''])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an integer as a string but received \`[""]\`]`
  );
});

test('map', () => {
  const myMap = new Map<number, string>();
  myMap.set(5, '5');

  expect(map(intString, string)({ '5': '5' })).toStrictEqual(myMap);

  expect(() => map(intString, string)('')).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an object but received \`""\`]`
  );
  expect(() => map(intString, string)(null)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an object but received \`null\`]`
  );
  expect(() =>
    map(intString, string)(undefined)
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an object but received \`undefined\`]`
  );
  expect(() => map(intString, string)(0)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an object but received \`0\`]`
  );
});

test('either', () => {
  expect(() => either(string, int)('5'));
  expect(() => either(string, int)(5));

  expect(() => either(string, int)(null)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an  or  but received \`null\`]`
  );
  expect(() =>
    either(string, int)(undefined)
  ).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an  or  but received \`undefined\`]`
  );
  expect(() => either(string, int)([])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an  or  but received \`[]\`]`
  );
  expect(() => either(string, int)({})).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected an  or  but received \`{}\`]`
  );
});

test('base64', () => {
  expect(base64('base64 string')).toEqual(
    Buffer.from([109, 171, 30, 235, 139, 45, 174, 41, 224])
  );

  expect(() => base64(null)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a base64 encoded string but received \`null\`]`
  );
  expect(() => base64(undefined)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a base64 encoded string but received \`undefined\`]`
  );
  expect(() => base64(0)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a base64 encoded string but received \`0\`]`
  );
  expect(() => base64([])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a base64 encoded string but received \`[]\`]`
  );
  expect(() => base64([''])).toThrowErrorMatchingInlineSnapshot(
    `[Error: Expected a base64 encoded string but received \`[""]\`]`
  );
});
