import { expect, test } from 'vitest';

import BugzillaAPI from '../src';

// Tests that rely on the network are not ideal but it's hard to otherwise
// verify that we can parse data from the real services. We don't test the
// actual data here as that can fluctuate, just the fact that we managed to
// successfully retrieve and validate the bugs.

test('Mozilla', async () => {
  let api = new BugzillaAPI('https://bugzilla.mozilla.org/');

  await expect(api.getBugs([645699, 1743832, 1749908])).resolves.toHaveLength(
    3
  );
});

test('Red Hat', async () => {
  let api = new BugzillaAPI('https://bugzilla.redhat.com/');

  await expect(
    api.getBugs([1944441, 1749908, 1205830, 1906064, 1730084])
  ).resolves.toHaveLength(5);
});
