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
let attachments: number[] = [];

beforeAll(async () => {
  api = new BugzillaAPI(
    'http://localhost:8088/bugzilla/',
    'admin@nowhere.com',
    'adminpass',
  );

  bugs.push(await api.createBug(bug));
  bugs.push(await api.createBug(bug));

  expect(bugs).toBeDefined();
  expect(bugs.length).toEqual(2);

  attachments.push(
    ...(await api.createAttachment(bugs[0] as number, {
      ids: [bugs[0] as number],
      summary: 'Test creation of simple attachment',
      file_name: 'image.png',
      data: Buffer.from('This is not a image.'),
      content_type: 'image/png',
    })),
    ...(await api.createAttachment(bugs[0] as number, {
      ids: [bugs[0] as number],
      summary: 'Test creation of complex attachment',
      file_name: 'patch.patch',
      data: Buffer.from('This is not a patch.'),
      content_type: '',
      comment: '',
      //   flags: [
      //     {
      //       name: "review",
      //       status: "?",
      //     },
      //   ],
      is_private: false,
      is_patch: true,
    })),
    ...(await api.createAttachment(bugs[0] as number, {
      ids: bugs,
      summary: 'Test creation of multiple attachments at once',
      file_name: 'image.png',
      data: Buffer.from('This is not a image.'),
      content_type: 'image/png',
    })),
  );

  expect(attachments).toBeDefined();
  expect(attachments.length).toEqual(4);
});

test('Get single attachment', async () => {
  await expect(api.getAttachment(1)).resolves.toEqual({
    bug_id: expect.anything(),
    content_type: 'image/png',
    creation_time: expect.anything(),
    creator: 'admin@nowhere.com',
    data: Buffer.from('This is not a image.'),
    file_name: 'image.png',
    flags: [],
    id: 1,
    is_obsolete: false,
    is_patch: false,
    is_private: false,
    last_change_time: expect.anything(),
    size: 20,
    summary: 'Test creation of simple attachment',
  });

  await expect(api.getAttachment(2)).resolves.toEqual({
    bug_id: expect.anything(),
    content_type: 'text/plain',
    creation_time: expect.anything(),
    creator: 'admin@nowhere.com',
    data: Buffer.from('This is not a patch.'),
    file_name: 'patch.patch',
    flags: [],
    id: 2,
    is_obsolete: false,
    is_patch: true,
    is_private: false,
    last_change_time: expect.anything(),
    size: 20,
    summary: 'Test creation of complex attachment',
  });
});

test('Get multiple attachments', async () => {
  await expect(api.getBugAttachments(bugs[0] as number)).resolves.toEqual([
    {
      bug_id: bugs[0],
      content_type: 'image/png',
      creation_time: expect.anything(),
      creator: 'admin@nowhere.com',
      data: Buffer.from('This is not a image.'),
      file_name: 'image.png',
      flags: [],
      id: 1,
      is_obsolete: false,
      is_patch: false,
      is_private: false,
      last_change_time: expect.anything(),
      size: 20,
      summary: 'Test creation of simple attachment',
    },
    {
      bug_id: bugs[0],
      content_type: 'text/plain',
      creation_time: expect.anything(),
      creator: 'admin@nowhere.com',
      data: Buffer.from('This is not a patch.'),
      file_name: 'patch.patch',
      flags: [],
      id: 2,
      is_obsolete: false,
      is_patch: true,
      is_private: false,
      last_change_time: expect.anything(),
      size: 20,
      summary: 'Test creation of complex attachment',
    },
    {
      bug_id: bugs[0],
      content_type: 'image/png',
      creation_time: expect.anything(),
      creator: 'admin@nowhere.com',
      data: Buffer.from('This is not a image.'),
      file_name: 'image.png',
      flags: [],
      id: 3,
      is_obsolete: false,
      is_patch: false,
      is_private: false,
      last_change_time: expect.anything(),
      size: 20,
      summary: 'Test creation of multiple attachments at once',
    },
  ]);

  await expect(api.getBugAttachments(bugs[1] as number)).resolves.toEqual([
    {
      bug_id: bugs[1],
      content_type: 'image/png',
      creation_time: expect.anything(),
      creator: 'admin@nowhere.com',
      data: Buffer.from('This is not a image.'),
      file_name: 'image.png',
      flags: [],
      id: 4,
      is_obsolete: false,
      is_patch: false,
      is_private: false,
      last_change_time: expect.anything(),
      size: 20,
      summary: 'Test creation of multiple attachments at once',
    },
  ]);
});

test(`Edit single attachment`, async () => {
  await expect(
    api.updateAttachment(1, {
      ids: [1],
      content_type: 'text/plain',
      comment: 'new comment',
      file_name: 'new filename',
      //   flags: [
      //     {
      //       id: 999,
      //       name: "new-flag",
      //       status: "?",
      //       new: true,
      //       requestee: "adminpass",
      //     },
      //   ],
      is_obsolete: true,
      is_patch: true,
      // is_private: true,
      summary: 'new summary',
    }),
  ).resolves.toEqual([
    {
      changes: new Map([
        ['file_name', { added: 'new filename', removed: 'image.png' }],
        ['content_type', { added: 'text/plain', removed: 'image/png' }],
        ['is_obsolete', { added: '1', removed: '0' }],
        [
          'summary',
          {
            added: 'new summary',
            removed: 'Test creation of simple attachment',
          },
        ],
        ['is_patch', { added: '1', removed: '0' }],
      ]),
      id: 1,
      last_change_time: expect.anything(),
    },
  ]);
});

test('Edit multiple attachments', async () => {
  await expect(
    api.updateAttachment(2, {
      ids: [2, 3],
      content_type: 'text/plain',
      comment: 'new comment',
      file_name: 'new filename',
      // flags: [{ name: "new-flag", status: "?", new: true }],
      is_obsolete: true,
      is_patch: true,
      // is_private: true,
      summary: 'new summary',
    }),
  ).resolves.toEqual([
    {
      changes: expect.anything(),
      // new Map([
      //   ["is_obsolete", { added: "1", removed: "0" }],
      //   ["file_name", { added: "new filename", removed: "patch.patch" }],
      //   [
      //     "summary",
      //     {
      //       added: "new summary",
      //       removed: "Test creation of complex attachment",
      //     },
      //   ],
      // ]),
      id: 2,
      last_change_time: expect.anything(),
    },
    {
      changes: expect.anything(),
      // new Map([
      //   ["file_name", { added: "new filename", removed: "image.png" }],
      //   [
      //     "summary",
      //     {
      //       added: "new summary",
      //       removed: "Test creation of simple attachment",
      //     },
      //   ],
      //   ["is_obsolete", { added: "1", removed: "0" }],
      //   ["content_type", { added: "text/plain", removed: "image/png" }],
      //   ["is_patch", { added: "1", removed: "0" }],
      // ]);
      id: 3,
      last_change_time: expect.anything(),
    },
  ]);
});

afterAll(() => {
  bugs = [];
  attachments = [];
});
