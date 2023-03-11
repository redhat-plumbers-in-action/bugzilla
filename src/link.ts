import { URLSearchParams, URL } from 'url';
import { z, ZodSchema } from 'zod';

import axios, { AxiosRequestConfig } from 'axios';
import { loginResponseSchema } from './types';

export type SearchParams =
  | Record<string, string>
  | [string, string][]
  | string
  | URLSearchParams;
export function params(search: SearchParams): URLSearchParams {
  if (search instanceof URLSearchParams) {
    return search;
  }

  return new URLSearchParams(search);
}

interface ApiError {
  error: true;
  message: string;
}

function isError(payload: unknown): payload is ApiError {
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return payload && typeof payload == 'object' && payload.error;
}

async function performRequest<
  TSchema extends ZodSchema,
  KValues extends z.infer<TSchema>,
>(config: AxiosRequestConfig, schema: TSchema): Promise<KValues> {
  try {
    let response = await axios.request({
      ...config,
      headers: {
        Accept: 'application/json',
        ...(config.headers ?? {}),
      },
    });

    if (isError(response.data)) {
      throw new Error(response.data.message);
    }

    return schema.parse(response.data);
  } catch (e: unknown) {
    if (axios.isAxiosError(e)) {
      throw new Error(e.message);
    } else {
      throw e;
    }
  }
}

/**
 * Responsible for requesting data from the bugzilla instance handling any
 * necessary authentication and error handling that must happen. The chief
 * access is through the `get`, `post` and `put` methods.
 */
export abstract class BugzillaLink {
  protected readonly instance: URL;

  public constructor(instance: URL) {
    this.instance = new URL('rest/', instance);
  }

  protected abstract request<
    TSchema extends ZodSchema,
    KValues extends z.infer<TSchema>,
  >(config: AxiosRequestConfig, schema: TSchema): Promise<KValues>;

  protected buildURL(path: string, query?: SearchParams): URL {
    let url = new URL(path, this.instance);
    if (query) {
      url.search = params(query).toString();
    }
    return url;
  }

  public async get<TSchema extends ZodSchema, KValues extends z.infer<TSchema>>(
    path: string,
    schema: TSchema,
    searchParams?: SearchParams,
  ): Promise<KValues> {
    return this.request(
      {
        url: this.buildURL(path, searchParams).toString(),
      },
      schema,
    );
  }

  public async post<
    R,
    TSchema extends ZodSchema,
    KValues extends z.infer<TSchema>,
  >(
    path: string,
    schema: TSchema,
    content: R,
    searchParams?: SearchParams,
  ): Promise<KValues> {
    return this.request(
      {
        url: this.buildURL(path, searchParams).toString(),
        method: 'POST',
        data: JSON.stringify(content),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      schema,
    );
  }

  public async put<
    R,
    TSchema extends ZodSchema,
    KValues extends z.infer<TSchema>,
  >(
    path: string,
    schema: TSchema,
    content: R,
    searchParams?: SearchParams,
  ): Promise<KValues> {
    return this.request(
      {
        url: this.buildURL(path, searchParams).toString(),
        method: 'PUT',
        data: JSON.stringify(content),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      schema,
    );
  }
}

export class PublicLink extends BugzillaLink {
  protected async request<
    TSchema extends ZodSchema,
    KValues extends z.infer<TSchema>,
  >(config: AxiosRequestConfig, schema: TSchema): Promise<KValues> {
    return performRequest(config, schema);
  }
}

/**
 * Handles authentication using an API key.
 */
export class ApiKeyLink extends BugzillaLink {
  public constructor(
    instance: URL,
    private readonly apiKey: string,
  ) {
    super(instance);
  }

  protected async request<
    TSchema extends ZodSchema,
    KValues extends z.infer<TSchema>,
  >(config: AxiosRequestConfig, schema: TSchema): Promise<KValues> {
    return performRequest(
      {
        ...config,
        headers: {
          ...(config.headers ?? {}),
          'X-BUGZILLA-API-KEY': this.apiKey,
          // Red Hat Bugzilla uses Authorization header - https://bugzilla.redhat.com/docs/en/html/api/core/v1/general.html#authentication
          Authorization: `Bearer ${this.apiKey}`,
        },
      },
      schema,
    );
  }
}

/**
 * Handles authentication using a username and password.
 */
export class PasswordLink extends BugzillaLink {
  private token: string | null = null;

  public constructor(
    instance: URL,
    private readonly username: string,
    private readonly password: string,
    private readonly restrictLogin: boolean,
  ) {
    super(instance);
  }

  private async login(): Promise<string> {
    let loginInfo = await performRequest(
      {
        url: this.buildURL('login', {
          login: this.username,
          password: this.password,
          restrict_login: String(this.restrictLogin),
        }).toString(),
      },
      loginResponseSchema,
    );

    return loginInfo.token;
  }

  protected async request<
    TSchema extends ZodSchema,
    KValues extends z.infer<TSchema>,
  >(config: AxiosRequestConfig, schema: TSchema): Promise<KValues> {
    if (!this.token) {
      this.token = await this.login();
    }

    return performRequest(
      {
        ...config,
        headers: {
          ...(config.headers ?? {}),
          'X-BUGZILLA-TOKEN': this.token,
        },
      },
      schema,
    );
  }
}
