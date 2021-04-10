import encodeGraph from '../encode.js';

test('simple', () => {
  const users = [
    { $key: '1', name: 'Alice', settings: { $val: ['hi'] } },
    { $key: '2', name: 'Bob', manager: { $ref: 'users.1' }, foo: null },
  ];

  const posts = [];
  const tags = { a: true, b: true };
  const version = 0;

  expect(encodeGraph({ users, posts, tags }, version)).toEqual([
    {
      key: 'tags',
      version,
      children: [
        { key: 'a', value: true, version },
        { key: 'b', value: true, version },
      ],
    },
    {
      key: 'users',
      version,
      children: [
        {
          key: '1',
          version,
          children: [
            { key: 'name', value: 'Alice', version },
            { key: 'settings', value: ['hi'], version },
          ],
        },
        {
          key: '2',
          version,
          children: [
            { key: 'foo', end: 'foo', version },
            { key: 'manager', path: ['users', '1'], version },
            { key: 'name', value: 'Bob', version },
          ],
        },
      ],
    },
  ]);
});

test('point_deletion', () => {
  const version = 0;
  expect(
    encodeGraph(
      {
        foo: null,
      },
      version,
    ),
  ).toEqual([{ key: 'foo', end: 'foo', version }]);
});

test('point_in_range_deletion', () => {
  const version = 0;
  expect(
    encodeGraph(
      [
        {
          $key: { cursor: ['foo'] },
        },
      ],
      version,
    ),
  ).toEqual([{ key: '\x000VKaQqw', end: '\x000VKaQqw', version }]);
});

test('range', () => {
  expect(encodeGraph([{ $key: { before: ['a'] } }], 0)).toEqual([
    {
      key: '',
      end: '\x000VKV\uffff',
      version: 0,
    },
  ]);
});

test('arrayCursor.encode', () => {
  expect(encodeGraph([{ $key: [23], $val: 25 }], 0)).toEqual([
    { key: '\x000VI-Ck--------', value: 25, version: 0 },
  ]);
});

test('bounded_range', () => {
  const result = encodeGraph([{ $key: { after: ['a'], before: ['b'] } }], 0);
  expect(result).toEqual([
    { key: '\x000VKW\0', end: '\x000VKW\uffff', version: 0 },
  ]);
});
