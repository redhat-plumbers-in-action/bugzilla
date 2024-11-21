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
    'adminpass',
  );

  bugs.push(await api.createBug(bug));
  bugs.push(await api.createBug(bug));
  bugs.push(
    await api.createBug({
      product: 'TestProduct',
      component: 'TestComponent',
      summary: 'A test bug 2',
      version: 'unspecified',
      description: 'This is a test bug 2',
      op_sys: 'Mac OS',
      platform: 'Macintosh',
      priority: 'High',
      severity: 'normal',
    }),
  );

  expect(bugs).toBeDefined();
  expect(bugs.length).toEqual(3);
});

test('Fetch bugs', async () => {
  let result = await api.getBugs([bugs[0] as number, bugs[1] as number]);
  expect(result).toEqual([
    {
      alias: [],
      assigned_to: 'admin@nowhere.com',
      assigned_to_detail: {
        id: 1,
        name: 'admin@nowhere.com',
        real_name: 'Insecure User',
      },
      blocks: [],
      cc: [],
      cc_detail: [],
      classification: 'Unclassified',
      component: 'TestComponent',
      creation_time: expect.anything(),
      creator: 'admin@nowhere.com',
      creator_detail: {
        id: 1,
        name: 'admin@nowhere.com',
        real_name: 'Insecure User',
      },
      depends_on: [],
      dupe_of: null,
      flags: [],
      groups: [],
      id: bugs[0],
      is_cc_accessible: true,
      is_confirmed: true,
      is_creator_accessible: true,
      is_open: true,
      keywords: [],
      last_change_time: expect.anything(),
      op_sys: 'Mac OS',
      platform: 'Macintosh',
      priority: 'High',
      product: 'TestProduct',
      qa_contact: '',
      qa_contact_detail: undefined,
      resolution: '',
      see_also: [],
      severity: 'major',
      status: 'CONFIRMED',
      summary: 'A test bug',
      target_milestone: '---',
      update_token: undefined,
      url: '',
      version: 'unspecified',
      whiteboard: '',
    },
    {
      alias: [],
      assigned_to: 'admin@nowhere.com',
      assigned_to_detail: {
        id: 1,
        name: 'admin@nowhere.com',
        real_name: 'Insecure User',
      },
      blocks: [],
      cc: [],
      cc_detail: [],
      classification: 'Unclassified',
      component: 'TestComponent',
      creation_time: expect.anything(),
      creator: 'admin@nowhere.com',
      creator_detail: {
        id: 1,
        name: 'admin@nowhere.com',
        real_name: 'Insecure User',
      },
      depends_on: [],
      dupe_of: null,
      flags: [],
      groups: [],
      id: bugs[1],
      is_cc_accessible: true,
      is_confirmed: true,
      is_creator_accessible: true,
      is_open: true,
      keywords: [],
      last_change_time: expect.anything(),
      op_sys: 'Mac OS',
      platform: 'Macintosh',
      priority: 'High',
      product: 'TestProduct',
      qa_contact: '',
      qa_contact_detail: undefined,
      resolution: '',
      see_also: [],
      severity: 'major',
      status: 'CONFIRMED',
      summary: 'A test bug',
      target_milestone: '---',
      update_token: undefined,
      url: '',
      version: 'unspecified',
      whiteboard: '',
    },
  ]);

  await expect(api.quicksearch('ALL')).resolves.toEqual(
    expect.arrayContaining(result),
  );
});

test('Update bug', async () => {
  await expect(
    api.updateBug(bugs[0] as number, {
      id_or_alias: bugs[0] as number,
      ids: [bugs[0] as number],
      blocks: { set: [bugs[1] as number] },
      comment: { comment: 'New comment', is_private: false },
      severity: 'normal',
    }),
  ).resolves.toEqual([
    {
      alias: [],
      changes: new Map([
        ['blocks', { added: '5', removed: '' }],
        ['severity', { added: 'normal', removed: 'major' }],
      ]),
      id: bugs[0],
      last_change_time: expect.anything(),
    },
  ]);
});

test('Update multiple bugs', async () => {
  await expect(
    api.updateBug(bugs[0] as number, {
      id_or_alias: bugs[0] as number,
      ids: [bugs[0] as number, bugs[1] as number],
      severity: 'normal',
    }),
  ).resolves.toEqual([
    {
      alias: [],
      changes: new Map([['severity', { added: 'normal', removed: 'major' }]]),
      id: bugs[0],
      last_change_time: expect.anything(),
    },
    {
      alias: [],
      changes: new Map([['severity', { added: 'normal', removed: 'major' }]]),
      id: bugs[1],
      last_change_time: expect.anything(),
    },
  ]);
});

test('Quickly search non-important bugs', async () => {
  await expect(api.quicksearch('severity:normal')).resolves.not.toThrow();
});

test('Get history of bug', async () => {
  await expect(api.bugHistory(bugs[2] as number)).resolves.toEqual([]);
});

test('Use of advance searching', async () => {
  const expected = await api.advancedSearch(
    'http://localhost:8088/bugzilla/buglist.cgi?email1=admin%40nowhere.com&severity=normal',
  );

  expected.forEach(bug => {
    expect(bug).toEqual(
      expect.objectContaining({
        severity: 'normal',
        creator: 'admin@nowhere.com',
      }),
    );
  });

  await expect(
    api.advancedSearch('email1=admin%40nowhere.com&severity=normal'),
  ).resolves.toEqual(expected);

  await expect(
    api.advancedSearch({
      email1: 'admin@nowhere.com',
      severity: 'normal',
    }),
  ).resolves.toEqual(expected);
});

afterEach(() => {
  bugs = [];
});
