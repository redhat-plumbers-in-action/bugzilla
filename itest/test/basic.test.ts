// @vitest-environment bugzilla-environment

import { expect, test } from 'vitest';

import BugzillaAPI from '../../src';

test('Public access', async () => {
  let api = new BugzillaAPI('http://localhost:8088/bugzilla/');

  await expect(api.version()).resolves.toBe('5.1.2');

  await expect(api.whoami()).rejects.toThrowError('401');

  await expect(api.quicksearch('ALL')).resolves.toEqual(expect.any(Array));
});

test('Authenticated access', async () => {
  let api = new BugzillaAPI(
    'http://localhost:8088/bugzilla/',
    'admin@nowhere.com',
    'adminpass'
  );

  await expect(api.version()).resolves.toBe('5.1.2');

  await expect(api.whoami()).resolves.toEqual({
    id: 1,
    name: 'admin@nowhere.com',
    real_name: 'Insecure User',
  });

  await expect(api.quicksearch('ALL')).resolves.toEqual(expect.any(Array));
});
