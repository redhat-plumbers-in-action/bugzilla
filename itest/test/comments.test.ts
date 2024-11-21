// @vitest-environment bugzilla-environment

import { afterEach, beforeEach, expect, test } from 'vitest';

import BugzillaAPI from '../../src';

let api: BugzillaAPI;

const bug = {
  product: 'TestProduct',
  component: 'TestComponent',
  summary: 'A test bug',
  version: 'unspecified',
  description: 'This is a test bug',
  op_sys: 'Mac OS',
  platform: 'Macintosh',
  priority: 'High',
  severity: 'major',
};

let bugs: number[] = [];

beforeEach(async () => {
  api = new BugzillaAPI(
    'http://localhost:8088/bugzilla/',
    'admin@nowhere.com',
    'adminpass'
  );

  bugs.push(await api.createBug(bug));
  bugs.push(await api.createBug(bug));

  expect(bugs).toBeDefined();
  expect(bugs.length).toEqual(2);
});

test('Create comment', async () => {
  await expect(
    api.createComment(bugs[0] as number, 'First comment!', {
      is_private: false,
    })
  ).resolves.not.toThrow();
});

test('getComment', async () => {
  await expect(api.getComment(3)).resolves.toEqual({
    attachment_id: null,
    bug_id: 1,
    count: 1,
    creation_time: expect.anything(),
    creator: 'admin@nowhere.com',
    id: 3,
    is_private: false,
    tags: [],
    text: 'First comment!',
    time: expect.anything(),
  });
});

test('getBugComments', async () => {
  await expect(api.getBugComments(bugs[0] as number)).resolves.toEqual([
    {
      attachment_id: null,
      bug_id: bugs[0],
      count: 0,
      creation_time: expect.anything(),
      creator: 'admin@nowhere.com',
      id: expect.anything(),
      is_private: false,
      tags: [],
      text: 'This is a test bug',
      time: expect.anything(),
    },
  ]);
});

afterEach(() => {
  bugs = [];
});
