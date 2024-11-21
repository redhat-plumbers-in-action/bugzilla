import { URLSearchParams, URL } from 'url';

import axios, { AxiosRequestConfig } from 'axios';
import { object, Validator } from './validators';
import { LoginResponseSpec } from './types';

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

async function performRequest<T>(
  config: AxiosRequestConfig,
  validator: Validator<T>
): Promise<T> {
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

    return validator(response.data);
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

  protected abstract request<T>(
    config: AxiosRequestConfig,
    validator: Validator<T>
  ): Promise<T>;

  protected buildURL(path: string, query?: SearchParams): URL {
    let url = new URL(path, this.instance);
    if (query) {
      url.search = params(query).toString();
    }
    return url;
  }

  public async get<T>(
    path: string,
    validator: Validator<T>,
    searchParams?: SearchParams
  ): Promise<T> {
    return this.request(
      {
        url: this.buildURL(path, searchParams).toString(),
      },
      validator
    );
  }

  public async post<R, T>(
    path: string,
    validator: Validator<T>,
    content: R,
    searchParams?: SearchParams
  ): Promise<T> {
    return this.request(
      {
        url: this.buildURL(path, searchParams).toString(),
        method: 'POST',
        data: JSON.stringify(content),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      validator
    );
  }

  public async put<R, T>(
    path: string,
    validator: Validator<T>,
    content: R,
    searchParams?: SearchParams
  ): Promise<T> {
    return this.request(
      {
        url: this.buildURL(path, searchParams).toString(),
        method: 'PUT',
        data: JSON.stringify(content),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      validator
    );
  }
}

export class PublicLink extends BugzillaLink {
  protected async request<T>(
    config: AxiosRequestConfig,
    validator: Validator<T>
  ): Promise<T> {
    return performRequest(config, validator);
  }
}

/**
 * Handles authentication using an API key.
 */
export class ApiKeyLink extends BugzillaLink {
  public constructor(
    instance: URL,
    private readonly apiKey: string
  ) {
    super(instance);
  }

  protected async request<T>(
    config: AxiosRequestConfig,
    validator: Validator<T>
  ): Promise<T> {
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
      validator
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
    private readonly restrictLogin: boolean
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
      object(LoginResponseSpec)
    );

    return loginInfo.token;
  }

  protected async request<T>(
    config: AxiosRequestConfig,
    validator: Validator<T>
  ): Promise<T> {
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
      validator
    );
  }
}
