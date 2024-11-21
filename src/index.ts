import { URL, URLSearchParams } from 'url';

import type { DateTime } from 'luxon';

import type { BugzillaLink, SearchParams } from './link';
import { PublicLink, params, PasswordLink, ApiKeyLink } from './link';
import { FilteredQuery } from './query';
import type {
  Bug,
  User,
  History,
  Comment,
  CreateCommentContent,
  CreateBugContent,
  UpdateBugContent,
  UpdatedBug,
  Attachment,
  CreateAttachmentContent,
  UpdateAttachmentContent,
  UpdatedAttachment,
} from './types';
import {
  HistoryLookupSpec,
  BugSpec,
  UserSpec,
  VersionSpec,
  CommentsSpec,
  CreatedCommentSpec,
  CreatedBugSpec,
  UpdatedBugTemplateSpec,
  AttachmentsSpec,
  CreatedAttachmentSpec,
  UpdatedAttachmentTemplateSpec,
} from './types';
import { array, object } from './validators';

export type {
  Bug,
  User,
  History,
  Change,
  Flag,
  Comment,
  Attachment,
} from './types';

export default class BugzillaAPI {
  private readonly link: BugzillaLink;

  public constructor(instance: URL | string);
  public constructor(instance: URL | string, apiKey: string);
  public constructor(
    instance: URL | string,
    username: string,
    password: string,
    restrictLogin?: boolean
  );
  public constructor(
    instance: URL | string,
    user?: string,
    password?: string,
    restrictLogin: boolean = false
  ) {
    let url = instance instanceof URL ? instance : new URL(instance);

    if (!user) {
      this.link = new PublicLink(url);
    } else if (password !== undefined) {
      this.link = new PasswordLink(url, user, password, restrictLogin);
    } else {
      this.link = new ApiKeyLink(url, user);
    }
  }

  public async version(): Promise<string> {
    let version = await this.link.get('version', object(VersionSpec));

    return version.version;
  }

  public whoami(): Promise<User> {
    return this.link.get('whoami', object(UserSpec));
  }

  public async bugHistory(
    bugId: number | string,
    since?: DateTime
  ): Promise<History[]> {
    let searchParams: URLSearchParams | undefined;

    if (since) {
      searchParams = new URLSearchParams();
      searchParams.set('new_since', since.toISODate() ?? '');
    }

    let bugs = await this.link.get(
      `bug/${bugId}/history`,
      object(HistoryLookupSpec),
      searchParams
    );

    let [bug] = bugs.bugs;
    if (!bug) {
      throw new Error('Bug not found.');
    }

    return bug.history;
  }

  public searchBugs(query: SearchParams): FilteredQuery<Bug> {
    return new FilteredQuery(
      async (
        includes: string[] | undefined,
        excludes: string[] | undefined
      ): Promise<Bug[]> => {
        let search = params(query);
        if (includes) {
          search.set('include_fields', includes.join(','));
        }
        if (excludes) {
          search.set('exclude_fields', excludes.join(','));
        }

        let result = await this.link.get(
          'bug',
          object({
            bugs: array(object(BugSpec, includes, excludes)),
          }),
          search
        );

        return result.bugs;
      }
    );
  }

  public getBugs(ids: (number | string)[]): FilteredQuery<Bug> {
    return this.searchBugs({
      id: ids.join(','),
    });
  }

  public quicksearch(query: string): FilteredQuery<Bug> {
    return this.searchBugs({
      quicksearch: query,
    });
  }

  public advancedSearch(
    query:
      | string
      | URL
      | Record<string, string>
      | [string, string][]
      | URLSearchParams
  ): FilteredQuery<Bug> {
    let searchParams: URLSearchParams;

    if (query instanceof URL) {
      searchParams = query.searchParams;
    } else if (typeof query == 'string' && query.startsWith('http')) {
      searchParams = new URL(query).searchParams;
    } else if (query instanceof URLSearchParams) {
      searchParams = query;
    } else {
      searchParams = new URLSearchParams(query);
    }

    searchParams.delete('list_id');

    return this.searchBugs(searchParams);
  }

  public async getComment(commentId: number): Promise<Comment | undefined> {
    let comment = await this.link.get(
      `bug/comment/${commentId}`,
      object(CommentsSpec)
    );

    if (!comment) {
      throw new Error(`Failed to get comment #${commentId}.`);
    }

    return comment.comments.get(commentId);
  }

  public async getBugComments(bugId: number): Promise<Comment[] | undefined> {
    let comments = await this.link.get(
      `bug/${bugId}/comment`,
      object(CommentsSpec)
    );

    if (!comments) {
      throw new Error(`Failed to get comments of bug #${bugId}.`);
    }

    return comments.bugs.get(bugId)?.comments;
  }

  public async createComment(
    bugId: number,
    comment: string,
    options: Partial<Omit<CreateCommentContent, 'comment'>> = {}
  ): Promise<number> {
    const content = {
      comment,
      is_private: options.is_private ?? false,
    };

    let commentStatus = await this.link.post(
      `bug/${bugId}/comment`,
      object(CreatedCommentSpec),
      content
    );

    if (!commentStatus) {
      throw new Error('Failed to create comment.');
    }

    return commentStatus.id;
  }

  public async createBug(bug: CreateBugContent): Promise<number> {
    let bugStatus = await this.link.post('bug', object(CreatedBugSpec), bug);

    if (!bugStatus) {
      throw new Error('Failed to create bug.');
    }

    return bugStatus.id;
  }

  public async updateBug(
    bugIdOrAlias: number | string,
    data: UpdateBugContent
  ): Promise<UpdatedBug[]> {
    let response = await this.link.put(
      `bug/${bugIdOrAlias}`,
      object(UpdatedBugTemplateSpec),
      data
    );

    if (!response) {
      throw new Error(`Failed to update bug #${bugIdOrAlias}.`);
    }

    return response.bugs;
  }

  public async getAttachment(
    attachmentId: number
  ): Promise<Attachment | undefined> {
    let attachment = await this.link.get(
      `bug/attachment/${attachmentId}`,
      object(AttachmentsSpec)
    );

    if (!attachment) {
      throw new Error(`Failed to get attachment #${attachmentId}.`);
    }

    return attachment.attachments.get(attachmentId);
  }

  public async getBugAttachments(
    bugId: number
  ): Promise<Attachment[] | undefined> {
    let attachments = await this.link.get(
      `bug/${bugId}/attachment`,
      object(AttachmentsSpec)
    );

    if (!attachments) {
      throw new Error(`Failed to get attachments of bug #${bugId}.`);
    }

    return attachments.bugs.get(bugId);
  }

  public async createAttachment(
    bugId: number,
    attachment: CreateAttachmentContent
  ): Promise<number[]> {
    const dataBase64 = {
      data: Buffer.from(attachment.data).toString('base64'),
    };

    let attachmentStatus = await this.link.post(
      `bug/${bugId}/attachment`,
      object(CreatedAttachmentSpec),
      { ...attachment, ...dataBase64 }
    );

    if (!attachmentStatus) {
      throw new Error('Failed to create attachment.');
    }

    return attachmentStatus.ids;
  }

  public async updateAttachment(
    attachmentId: number,
    data: UpdateAttachmentContent
  ): Promise<UpdatedAttachment[]> {
    let response = await this.link.put(
      `bug/attachment/${attachmentId}`,
      object(UpdatedAttachmentTemplateSpec),
      data
    );

    if (!response) {
      throw new Error(`Failed to update attachment #${attachmentId}.`);
    }

    return response.attachments;
  }
}
