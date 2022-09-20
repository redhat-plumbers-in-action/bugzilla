/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-redeclare */
import type { DateTime } from 'luxon';

import {
  int,
  string,
  array,
  object,
  boolean,
  datetime,
  nullable,
  optional,
  maybeArray,
  ObjectSpec,
  intString,
  map,
  double,
  base64,
} from './validators';

type int = number;
type double = number;
type datetime = DateTime;

export interface LoginResponse {
  id: int;
  token: string;
}

export const LoginResponseSpec: ObjectSpec<LoginResponse> = {
  id: int,
  token: string,
};

export interface Version {
  version: string;
}

export const VersionSpec: ObjectSpec<Version> = {
  version: string,
};

export interface User {
  id: int;
  name: string;
  real_name: string;
}

export const UserSpec: ObjectSpec<User> = {
  id: int,
  name: string,
  real_name: string,
};

export interface SetFlag {
  status: string;
  name?: string;
  type_id?: int;
  requestee?: string;
}

export const SetFlagSpec: ObjectSpec<SetFlag> = {
  status: string,
  name: optional(string),
  type_id: optional(int),
  requestee: optional(string),
};

export interface UpdateFlag extends SetFlag {
  id?: int;
  new?: boolean;
}

export const UpdateFlagSpec: ObjectSpec<UpdateFlag> = {
  ...SetFlagSpec,
  id: optional(int),
  new: optional(boolean),
};

export interface Flag extends SetFlag {
  id: int;
  creation_date: datetime;
  modification_date: datetime;
  setter: string;
}

export const FlagSpec: ObjectSpec<Flag> = {
  ...SetFlagSpec,
  id: int,
  creation_date: datetime,
  modification_date: datetime,
  setter: string,
};

export interface Bug {
  alias: string | string[];
  assigned_to: string;
  assigned_to_detail: User;
  blocks: number[];
  cc: string[];
  cc_detail: User[];
  classification: string;
  component: string | string[];
  creation_time: datetime;
  creator: string;
  creator_detail: User;
  depends_on: number[];
  dupe_of: int | null;
  flags: Flag[] | undefined;
  groups: string[];
  id: int;
  is_cc_accessible: boolean;
  is_confirmed: boolean;
  is_open: boolean;
  is_creator_accessible: boolean;
  keywords: string[];
  last_change_time: datetime;
  op_sys: string;
  platform: string;
  priority: string;
  product: string;
  qa_contact: string;
  qa_contact_detail?: User;
  resolution: string;
  see_also: string[];
  severity: string;
  status: string;
  summary: string;
  target_milestone: string;
  update_token?: string;
  url: string;
  version: string | string[];
  whiteboard: string;
}

export const BugSpec: ObjectSpec<Bug> = {
  alias: nullable(maybeArray(string), []),
  assigned_to: string,
  assigned_to_detail: object(UserSpec),
  blocks: array(int),
  cc: array(string),
  cc_detail: array(object(UserSpec)),
  classification: string,
  component: maybeArray(string),
  creation_time: datetime,
  creator: string,
  creator_detail: object(UserSpec),
  depends_on: array(int),
  dupe_of: nullable(int),
  flags: optional(array(object(FlagSpec))),
  groups: array(string),
  id: int,
  is_cc_accessible: boolean,
  is_confirmed: boolean,
  is_open: boolean,
  is_creator_accessible: boolean,
  keywords: array(string),
  last_change_time: datetime,
  op_sys: string,
  platform: string,
  priority: string,
  product: string,
  qa_contact: string,
  qa_contact_detail: optional(object(UserSpec)),
  resolution: string,
  see_also: array(string),
  severity: string,
  status: string,
  summary: string,
  target_milestone: string,
  update_token: optional(string),
  url: string,
  version: maybeArray(string),
  whiteboard: string,
};

export interface Change {
  field_name: string;
  removed: string;
  added: string;
  attachment_id?: int;
}

export const ChangeSpec: ObjectSpec<Change> = {
  field_name: string,
  removed: string,
  added: string,
  attachment_id: optional(int),
};

export interface History {
  when: datetime;
  who: string;
  changes: Change[];
}

export const HistorySpec: ObjectSpec<History> = {
  when: datetime,
  who: string,
  changes: array(object(ChangeSpec)),
};

export interface BugHistory {
  id: int;
  alias: string[];
  history: History[];
}

export const BugHistorySpec: ObjectSpec<BugHistory> = {
  id: int,
  alias: array(string),
  history: array(object(HistorySpec)),
};

export interface HistoryLookup {
  bugs: BugHistory[];
}

export const HistoryLookupSpec: ObjectSpec<HistoryLookup> = {
  bugs: array(object(BugHistorySpec)),
};

export interface Comment {
  attachment_id?: int | null;
  bug_id: int;
  count: int;
  creation_time: datetime;
  creator: string;
  id: int;
  is_private: boolean;
  tags: string[];
  time: datetime;
  text: string;
}

export const CommentSpec: ObjectSpec<Comment> = {
  attachment_id: nullable(optional(int)),
  bug_id: int,
  count: int,
  creation_time: datetime,
  creator: string,
  id: int,
  is_private: boolean,
  tags: array(string),
  time: datetime,
  text: string,
};

export interface CommentsTemplate {
  comments: Comment[];
}

export const CommentsTemplateSpec: ObjectSpec<CommentsTemplate> = {
  comments: array(object(CommentSpec)),
};

export interface Comments {
  bugs: Map<number, CommentsTemplate>;
  comments: Map<number, Comment>;
}

export const CommentsSpec: ObjectSpec<Comments> = {
  bugs: map(intString, object(CommentsTemplateSpec)),
  comments: map(intString, object(CommentSpec)),
};

export interface CreateCommentContent {
  comment: string;
  is_private: boolean;
}

export interface CreatedComment {
  id: int;
}

export const CreatedCommentSpec: ObjectSpec<CreatedComment> = {
  id: int,
};

export interface CreateBugContent {
  product: string;
  component: string;
  summary: string;
  version: string;
  description: string;
  op_sys: string;
  platform: string;
  priority: string;
  severity: string;
  alias?: string[];
  assigned_to?: string;
  cc?: string[];
  comment_is_private?: boolean;
  comment_tags?: string[];
  groups?: string[];
  keywords?: string[];
  qa_contact?: string;
  status?: string;
  resolution?: string;
  target_milestone?: string;
  flags?: SetFlag[];
}

export interface CreatedBug {
  id: int;
}

export const CreatedBugSpec: ObjectSpec<CreatedBug> = {
  id: int,
};

export interface UpdateList<T> {
  add?: T[];
  remove?: T[];
}

export type UpdateOrReplaceList<T> =
  | UpdateList<T>
  | {
      set?: T[];
    };

export interface UpdateBugContent {
  id_or_alias: int | string | string[];
  ids: (int | string)[];
  alias?: UpdateOrReplaceList<string>;
  assigned_to?: string;
  blocks?: UpdateOrReplaceList<int>;
  depends_on?: UpdateOrReplaceList<int>;
  cc?: UpdateList<string>;
  is_cc_accessible?: boolean;
  comment?: CreateCommentContent;
  comment_is_private?: Map<number, boolean>;
  comment_tags?: string[];
  component?: string;
  deadline?: datetime;
  dupe_of?: int;
  estimated_time?: double;
  flags?: UpdateFlag[];
  groups?: UpdateList<string>;
  keywords?: UpdateOrReplaceList<string>;
  op_sys?: string;
  platform?: string;
  priority?: string;
  product?: string;
  qa_contact?: string;
  is_creator_accessible?: boolean;
  remaining_time?: double;
  reset_assigned_to?: boolean;
  reset_qa_contact?: boolean;
  resolution?: string;
  see_also?: UpdateList<string>;
  severity?: string;
  status?: string;
  summary?: string;
  target_milestone?: string;
  url?: string;
  version?: string;
  whiteboard?: string;
  work_time?: double;
}

export interface Changes {
  added: string;
  removed: string;
}

const ChangesSpec: ObjectSpec<Changes> = {
  added: string,
  removed: string,
};

export interface UpdatedBug {
  id: int;
  alias: string[];
  last_change_time: datetime;
  changes: Map<
    Omit<keyof UpdateBugContent, 'id_or_alias' | 'ids' | 'alias'>,
    Changes
  >;
}

export const UpdatedBugSpec: ObjectSpec<UpdatedBug> = {
  id: int,
  alias: array(string),
  last_change_time: datetime,
  changes: map(string, object(ChangesSpec)),
};

export interface UpdatedBugTemplate {
  bugs: UpdatedBug[];
}

export const UpdatedBugTemplateSpec: ObjectSpec<UpdatedBugTemplate> = {
  bugs: array(object(UpdatedBugSpec)),
};

export interface Attachment {
  data: Buffer;
  size: int;
  creation_time: datetime;
  last_change_time: datetime;
  id: int;
  bug_id: int;
  file_name: string;
  summary: string;
  content_type: string;
  is_private: boolean;
  is_obsolete: boolean;
  is_patch: boolean;
  creator: string;
  flags: Flag[];
}

export const AttachmentSpec: ObjectSpec<Attachment> = {
  data: base64,
  size: int,
  creation_time: datetime,
  last_change_time: datetime,
  id: int,
  bug_id: int,
  file_name: string,
  summary: string,
  content_type: string,
  is_private: boolean,
  is_obsolete: boolean,
  is_patch: boolean,
  creator: string,
  flags: array(object(FlagSpec)),
};

export interface Attachments {
  bugs: Map<number, Attachment[]>;
  attachments: Map<number, Attachment>;
}

export const AttachmentsSpec: ObjectSpec<Attachments> = {
  bugs: map(intString, array(object(AttachmentSpec))),
  attachments: map(intString, object(AttachmentSpec)),
};

export interface CreateAttachmentContent {
  ids: int[];
  data: Buffer | ArrayBuffer;
  file_name: string;
  summary: string;
  content_type: string;
  comment?: string;
  is_patch?: boolean;
  is_private?: boolean;
  flags?: SetFlag[];
}

export interface CreatedAttachment {
  ids: int[];
}

export const CreatedAttachmentSpec: ObjectSpec<CreatedAttachment> = {
  ids: array(int),
};

export interface UpdateAttachmentContent {
  attachment_id?: int;
  ids?: int[];
  file_name?: string;
  summary?: string;
  comment?: string;
  content_type?: string;
  is_patch?: boolean;
  is_private?: boolean;
  is_obsolete?: boolean;
  flags?: UpdateFlag[];
}

export interface UpdatedAttachment {
  id: int;
  last_change_time: datetime;
  changes: Map<
    Omit<keyof UpdateAttachmentContent, 'attachment_id' | 'ids'>,
    Changes
  >;
}

export const UpdatedAttachmentSpec: ObjectSpec<UpdatedAttachment> = {
  id: int,
  last_change_time: datetime,
  changes: map(string, object(ChangesSpec)),
};

export interface UpdatedAttachmentTemplate {
  attachments: UpdatedAttachment[];
}

export const UpdatedAttachmentTemplateSpec: ObjectSpec<UpdatedAttachmentTemplate> =
  {
    attachments: array(object(UpdatedAttachmentSpec)),
  };
