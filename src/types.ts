/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-redeclare */
import { Base64 } from 'js-base64';
import { z } from 'zod';

export const loginResponseSchema = z.object({
  id: z.number(),
  token: z.string(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const versionSchema = z.object({
  version: z.string(),
});

export type Version = z.infer<typeof versionSchema>;

export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  real_name: z.string(),
});

export type User = z.infer<typeof userSchema>;

export const setFlagSchema = z.object({
  status: z.string(),
  name: z.string().optional(),
  type_id: z.number().optional(),
  requestee: z.string().optional(),
});

export type SetFlag = z.infer<typeof setFlagSchema>;

export const updateFlagSchema = setFlagSchema.extend({
  id: z.number().optional(),
  new: z.boolean().optional(),
});

export type UpdateFlag = z.infer<typeof updateFlagSchema>;

export const flagSchema = setFlagSchema.extend({
  id: z.number(),
  creation_date: z.string().datetime(),
  modification_date: z.string().datetime(),
  setter: z.string(),
});

export type Flag = z.infer<typeof flagSchema>;

export const bugSchema = z.object({
  alias: z.union([z.string(), z.array(z.string()), z.null()]),
  assigned_to: z.string(),
  assigned_to_detail: userSchema,
  blocks: z.array(z.number()),
  cc: z.array(z.string()),
  cc_detail: z.array(userSchema),
  classification: z.string(),
  component: z.union([z.string(), z.array(z.string())]),
  creation_time: z.string().datetime(),
  creator: z.string(),
  creator_detail: userSchema,
  depends_on: z.array(z.number()),
  dupe_of: z.union([z.number(), z.null(), z.null()]),
  flags: z.union([z.array(flagSchema), z.undefined()]),
  groups: z.array(z.string()),
  id: z.number(),
  is_cc_accessible: z.boolean(),
  is_confirmed: z.boolean(),
  is_open: z.boolean(),
  is_creator_accessible: z.boolean(),
  keywords: z.array(z.string()),
  last_change_time: z.string().datetime(),
  op_sys: z.string(),
  platform: z.string(),
  priority: z.string(),
  product: z.string(),
  qa_contact: z.string(),
  qa_contact_detail: userSchema.optional(),
  resolution: z.string(),
  see_also: z.union([z.array(z.string()), z.undefined()]),
  severity: z.string(),
  status: z.string(),
  summary: z.string(),
  target_milestone: z.string(),
  update_token: z.string().optional(),
  url: z.string(),
  version: z.union([z.string(), z.array(z.string())]),
  whiteboard: z.string(),
});

export type Bug = z.infer<typeof bugSchema>;

export const changeSchema = z.object({
  field_name: z.string(),
  removed: z.string(),
  added: z.string(),
  attachment_id: z.number().optional(),
});

export type Change = z.infer<typeof changeSchema>;

export const historySchema = z.object({
  when: z.string().datetime(),
  who: z.string(),
  changes: z.array(changeSchema),
});

export type History = z.infer<typeof historySchema>;

export const bugHistorySchema = z.object({
  id: z.number(),
  alias: z.array(z.string()),
  history: z.array(historySchema),
});

export type BugHistory = z.infer<typeof bugHistorySchema>;

export const historyLookupSchema = z.object({
  bugs: z.array(bugHistorySchema),
});

export type HistoryLookup = z.infer<typeof historyLookupSchema>;

export const commentSchema = z.object({
  attachment_id: z.union([z.number(), z.null()]).optional(),
  bug_id: z.number(),
  count: z.number(),
  creation_time: z.string().datetime(),
  creator: z.string(),
  id: z.number(),
  is_private: z.boolean(),
  tags: z.array(z.string()),
  time: z.string().datetime(),
  text: z.string(),
});

export type Comment = z.infer<typeof commentSchema>;

export const commentsTemplateSchema = z.object({
  comments: z.array(commentSchema),
});

export type CommentsTemplate = z.infer<typeof commentsTemplateSchema>;

function castObjectToMap<K extends z.ZodTypeAny, V extends z.ZodTypeAny>(
  keyValidator: K,
  valueValidator: V,
) {
  return z.record(keyValidator, valueValidator).transform(record => {
    let result = new Map<z.infer<K>, z.infer<V>>();

    for (let [k, v] of Object.entries(record)) {
      // if (typeof k === 'number') {
      //   result.set(k, v);
      // }
      if (k?.toString()) {
        result.set(k.toString(), v);
      }
    }

    return result;
  });
}

export const commentsSchema = z.object({
  bugs: castObjectToMap(z.number(), commentsTemplateSchema),
  comments: castObjectToMap(z.number(), commentSchema),
});

export type Comments = z.infer<typeof commentsSchema>;

export const createCommentContentSchema = z.object({
  comment: z.string(),
  is_private: z.boolean(),
});

export type CreateCommentContent = z.infer<typeof createCommentContentSchema>;

export const createdCommentSchema = z.object({
  id: z.number(),
});

export type CreatedComment = z.infer<typeof createdCommentSchema>;

export const createBugContentSchema = z.object({
  product: z.string(),
  component: z.string(),
  summary: z.string(),
  version: z.string(),
  description: z.string(),
  op_sys: z.string(),
  platform: z.string(),
  priority: z.string(),
  severity: z.string(),
  alias: z.array(z.string()).optional(),
  assigned_to: z.string().optional(),
  cc: z.array(z.string()).optional(),
  comment_is_private: z.boolean().optional(),
  comment_tags: z.array(z.string()).optional(),
  groups: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  qa_contact: z.string().optional(),
  status: z.string().optional(),
  resolution: z.string().optional(),
  target_milestone: z.string().optional(),
  flags: z.array(setFlagSchema).optional(),
});

export type CreateBugContent = z.infer<typeof createBugContentSchema>;

export const createdBugSchema = z.object({
  id: z.number(),
});

export type CreatedBug = z.infer<typeof createdBugSchema>;

function updateListSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    add: z.array(itemSchema).optional(),
    remove: z.array(itemSchema).optional(),
  });
}

function updateOrReplaceListSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.union([
    updateListSchema(itemSchema),
    z.object({
      set: z.array(itemSchema).optional(),
    }),
  ]);
}

export const updateBugContentSchema = z.object({
  id_or_alias: z.union([z.number(), z.string(), z.array(z.string())]),
  ids: z.array(z.union([z.number(), z.string()])),
  alias: updateOrReplaceListSchema(z.string()),
  assigned_to: z.string().optional(),
  blocks: updateOrReplaceListSchema(z.number()).optional(),
  depends_on: updateOrReplaceListSchema(z.number()).optional(),
  cc: updateListSchema(z.string()).optional(),
  is_cc_accessible: z.boolean().optional(),
  comment: createCommentContentSchema.optional(),
  comment_is_private: castObjectToMap(z.number(), z.boolean()).optional(),
  comment_tags: z.array(z.string()).optional(),
  component: z.string().optional(),
  deadline: z.string().datetime().optional(),
  dupe_of: z.number().optional(),
  estimated_time: z.number().optional(),
  flags: z.array(updateFlagSchema).optional(),
  groups: updateListSchema(z.string()).optional(),
  keywords: updateOrReplaceListSchema(z.string()).optional(),
  op_sys: z.string().optional(),
  platform: z.string().optional(),
  priority: z.string().optional(),
  product: z.string().optional(),
  qa_contact: z.string().optional(),
  is_creator_accessible: z.boolean().optional(),
  remaining_time: z.number().optional(),
  see_also: updateListSchema(z.string()).optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  summary: z.string().optional(),
  target_milestone: z.string().optional(),
  url: z.string().optional(),
  version: z.string().optional(),
  whiteboard: z.string().optional(),
  work_time: z.number().optional(),
});

export type UpdateBugContent = z.infer<typeof updateBugContentSchema>;

export const changesSchema = z.object({
  added: z.string(),
  removed: z.string(),
});

export type Changes = z.infer<typeof changesSchema>;

export const updatedBugSchema = z.object({
  id: z.number(),
  alias: z.array(z.string()),
  last_change_time: z.string().datetime(),
  changes: castObjectToMap(z.string(), changesSchema),
});

export type UpdatedBug = z.infer<typeof updatedBugSchema>;

export const updatedBugTemplateSchema = z.object({
  bugs: z.array(updatedBugSchema),
});

export type UpdatedBugTemplate = z.infer<typeof updatedBugTemplateSchema>;

export const attachmentSchema = z.object({
  // TODO: it should probably return a Buffer instead of a string
  data: z.string().refine(Base64.isValid),
  size: z.number(),
  creation_time: z.string().datetime(),
  last_change_time: z.string().datetime(),
  id: z.number(),
  bug_id: z.number(),
  file_name: z.string(),
  summary: z.string(),
  content_type: z.string(),
  is_private: z.boolean(),
  is_obsolete: z.boolean(),
  is_patch: z.boolean(),
  creator: z.string(),
  flags: z.array(flagSchema),
});

export type Attachment = z.infer<typeof attachmentSchema>;

export const attachmentsSchema = z.object({
  bugs: castObjectToMap(z.number(), z.array(attachmentSchema)),
  attachments: castObjectToMap(z.number(), attachmentSchema),
});

export type Attachments = z.infer<typeof attachmentsSchema>;

export const createAttachmentContentSchema = z.object({
  ids: z.array(z.number()),
  // TODO: Buffer | ArrayBuffer
  data: z.union([z.any(), z.string()]),
  file_name: z.string(),
  summary: z.string(),
  content_type: z.string(),
  comment: z.string().optional(),
  is_patch: z.boolean().optional(),
  is_private: z.boolean().optional(),
  flags: z.array(setFlagSchema).optional(),
});

export type CreateAttachmentContent = z.infer<
  typeof createAttachmentContentSchema
>;

export const createdAttachmentSchema = z.object({
  ids: z.array(z.number()),
});

export type CreatedAttachment = z.infer<typeof createdAttachmentSchema>;

export const updateAttachmentContentSchema = z.object({
  attachment_id: z.number().optional(),
  ids: z.array(z.number()).optional(),
  file_name: z.string().optional(),
  summary: z.string().optional(),
  comment: z.string().optional(),
  content_type: z.string().optional(),
  is_patch: z.boolean().optional(),
  is_private: z.boolean().optional(),
  is_obsolete: z.boolean().optional(),
  flags: z.array(updateFlagSchema).optional(),
});

export type UpdateAttachmentContent = z.infer<
  typeof updateAttachmentContentSchema
>;

export const updatedAttachmentSchema = z.object({
  id: z.number(),
  last_change_time: z.string().datetime(),
  changes: castObjectToMap(z.string(), changesSchema),
});

export type UpdatedAttachment = z.infer<typeof updatedAttachmentSchema>;

export const updatedAttachmentTemplateSchema = z.object({
  attachments: z.array(updatedAttachmentSchema),
});

export type UpdatedAttachmentTemplate = z.infer<typeof updatedAttachmentSchema>;
