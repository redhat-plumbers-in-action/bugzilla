import { URL } from 'url';
import { afterAll, afterEach, beforeAll, expect, test, vi } from 'vitest';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { PublicLink, ApiKeyLink, PasswordLink } from '../src/link';
import { int, object, string } from '../src/validators';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('PublicLink', async () => {
  let link = new PublicLink(new URL('http://bugzilla.test.org/test/'));

  let responseHandler = vi.fn(
    () =>
      new HttpResponse(
        JSON.stringify({
          foo: 'Bar',
          length: 38,
        }),
      ),
  );

  server.use(
    http.get('http://bugzilla.test.org/test/rest/foo', responseHandler),
  );

  let testSpec = object({
    foo: string,
    length: int,
  });

  let result = await link.get('foo', testSpec);

  expect(result).toEqual({
    foo: 'Bar',
    length: 38,
  });

  expect(responseHandler).toHaveBeenCalledTimes(1);
  expect(responseHandler).toHaveBeenCalledWith(
    expect.objectContaining({
      request: expect.objectContaining({
        method: 'GET',
        url: 'http://bugzilla.test.org/test/rest/foo',
      }),
    }),
  );
});

test('ApiKeyLink', async () => {
  let link = new ApiKeyLink(
    new URL('http://bugzilla.test.org/test/'),
    'my-api-key',
  );

  let responseHandler = vi.fn(
    () =>
      new HttpResponse(
        JSON.stringify({
          foo: 'Bar',
          length: 38,
        }),
      ),
  );

  server.use(
    http.get('http://bugzilla.test.org/test/rest/foo', responseHandler),
  );

  let testSpec = object({
    foo: string,
    length: int,
  });

  let result = await link.get('foo', testSpec);

  expect(result).toEqual({
    foo: 'Bar',
    length: 38,
  });

  expect(responseHandler).toHaveBeenCalledTimes(1);
  expect(responseHandler).toHaveBeenCalledWith(
    expect.objectContaining({
      request: expect.objectContaining({
        method: 'GET',
        url: 'http://bugzilla.test.org/test/rest/foo',
      }),
    }),
  );
});

test('PasswordLink', async () => {
  let link = new PasswordLink(
    new URL('http://bugzilla.test.org/test/'),
    'my-name',
    'my-password',
    true,
  );

  let loginHandler = vi.fn(
    () =>
      new HttpResponse(
        JSON.stringify({
          id: 57,
          token: 'my-token',
        }),
      ),
  );

  server.use(
    http.get('http://bugzilla.test.org/test/rest/login', loginHandler),
  );

  let responseHandler = vi.fn(
    () =>
      new HttpResponse(
        JSON.stringify({
          foo: 'Bar',
          length: 38,
        }),
      ),
  );

  server.use(
    http.get('http://bugzilla.test.org/test/rest/foo', responseHandler),
  );

  let testSpec = object({
    foo: string,
    length: int,
  });

  let result = await link.get('foo', testSpec);

  expect(result).toEqual({
    foo: 'Bar',
    length: 38,
  });

  expect(loginHandler).toHaveBeenCalledTimes(1);
  expect(loginHandler).toHaveBeenCalledWith(
    expect.objectContaining({
      request: expect.objectContaining({
        method: 'GET',
        url: 'http://bugzilla.test.org/test/rest/login?login=my-name&password=my-password&restrict_login=true',
      }),
    }),
  );

  expect(responseHandler).toHaveBeenCalledTimes(1);
  expect(responseHandler).toHaveBeenCalledWith(
    expect.objectContaining({
      request: expect.objectContaining({
        method: 'GET',
        url: 'http://bugzilla.test.org/test/rest/foo',
      }),
    }),
  );

  loginHandler.mockClear();
  responseHandler.mockClear();

  await link.get('foo', testSpec);
  expect(loginHandler).toHaveBeenCalledTimes(0);

  expect(responseHandler).toHaveBeenCalledTimes(1);
  expect(responseHandler).toHaveBeenCalledWith(
    expect.objectContaining({
      request: expect.objectContaining({
        method: 'GET',
        url: 'http://bugzilla.test.org/test/rest/foo',
      }),
    }),
  );
});
