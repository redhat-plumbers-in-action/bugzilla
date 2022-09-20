import {
  DefaultBodyType,
  PathParams,
  ResponseComposition,
  rest,
  RestContext,
  RestRequest,
} from 'msw';
import { setupServer } from 'msw/node';
import { URL } from 'url';

import { PublicLink, ApiKeyLink, PasswordLink } from '../src/link';
import { int, object, string } from '../src/validators';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function callArgs<A extends any[]>(
  fn: jest.Mock<unknown, A>,
  call: number = 0,
): A {
  let args = fn.mock.calls[call];
  if (args === undefined) {
    throw new Error(
      'Mock function was not called the expected number of times.',
    );
  }

  return args;
}

test('PublicLink', async () => {
  let link = new PublicLink(new URL('http://bugzilla.test.org/test/'));

  let responseHandler = jest.fn(
    (
      req: RestRequest<never, PathParams>,
      res: ResponseComposition<DefaultBodyType>,
      ctx: RestContext,
    ) =>
      res(
        ctx.json({
          foo: 'Bar',
          length: 38,
        }),
      ),
  );

  server.use(
    rest.get('http://bugzilla.test.org/test/rest/foo', responseHandler),
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
  let [{ url, method, headers }] = callArgs(responseHandler);
  expect(method).toBe('GET');
  expect(url.href).toBe('http://bugzilla.test.org/test/rest/foo');
  expect(headers.get('Accept')).toBe('application/json');
});

test('ApiKeyLink', async () => {
  let link = new ApiKeyLink(
    new URL('http://bugzilla.test.org/test/'),
    'my-api-key',
  );

  let responseHandler = jest.fn((req, res, ctx) =>
    res(
      ctx.json({
        foo: 'Bar',
        length: 38,
      }),
    ),
  );

  server.use(
    rest.get('http://bugzilla.test.org/test/rest/foo', responseHandler),
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
  let [{ url, method, headers }] = callArgs(responseHandler);
  expect(method).toBe('GET');
  expect(url.href).toBe('http://bugzilla.test.org/test/rest/foo');
  expect(headers.get('Accept')).toBe('application/json');
  expect(headers.get('X-BUGZILLA-API-KEY')).toBe('my-api-key');
});

test('PasswordLink', async () => {
  let link = new PasswordLink(
    new URL('http://bugzilla.test.org/test/'),
    'my-name',
    'my-password',
    true,
  );

  let loginHandler = jest.fn((req, res, ctx) =>
    res(
      ctx.json({
        id: 57,
        token: 'my-token',
      }),
    ),
  );

  server.use(
    rest.get('http://bugzilla.test.org/test/rest/login', loginHandler),
  );

  let responseHandler = jest.fn((req, res, ctx) =>
    res(
      ctx.json({
        foo: 'Bar',
        length: 38,
      }),
    ),
  );

  server.use(
    rest.get('http://bugzilla.test.org/test/rest/foo', responseHandler),
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
  let [{ url, method, headers }] = callArgs(loginHandler);
  expect(method).toBe('GET');
  expect(url.href).toBe(
    'http://bugzilla.test.org/test/rest/login?login=my-name&password=my-password&restrict_login=true',
  );

  expect(responseHandler).toHaveBeenCalledTimes(1);
  [{ url, method, headers }] = callArgs(responseHandler);
  expect(method).toBe('GET');
  expect(url.href).toBe('http://bugzilla.test.org/test/rest/foo');
  expect(headers.get('Accept')).toBe('application/json');
  expect(headers.get('X-BUGZILLA-TOKEN')).toBe('my-token');

  loginHandler.mockClear();
  responseHandler.mockClear();

  await link.get('foo', testSpec);
  expect(loginHandler).toHaveBeenCalledTimes(0);

  expect(responseHandler).toHaveBeenCalledTimes(1);
  [{ url, method, headers }] = callArgs(responseHandler);
  expect(method).toBe('GET');
  expect(url.href).toBe('http://bugzilla.test.org/test/rest/foo');
  expect(headers.get('Accept')).toBe('application/json');
  expect(headers.get('X-BUGZILLA-TOKEN')).toBe('my-token');
});
