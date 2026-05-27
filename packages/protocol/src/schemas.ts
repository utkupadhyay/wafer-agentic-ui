import { z } from "zod";

const baseEventSchema = z.object({
  threadId: z.string(),
  createdAt: z.string()
});

const runStartedSchema = baseEventSchema.extend({
  type: z.literal("run.started"),
  runId: z.string()
});

const runCompletedSchema = baseEventSchema.extend({
  type: z.literal("run.completed"),
  runId: z.string()
});

const runFailedSchema = baseEventSchema.extend({
  type: z.literal("run.failed"),
  runId: z.string(),
  error: z.string()
});

const messageCreatedSchema = baseEventSchema.extend({
  type: z.literal("message.created"),
  messageId: z.string(),
  role: z.enum(["system", "user", "assistant", "tool"]),
  content: z.string(),
  runId: z.string().optional()
});

const messageDeltaSchema = baseEventSchema.extend({
  type: z.literal("message.delta"),
  messageId: z.string(),
  delta: z.string(),
  runId: z.string()
});

const toolCalledSchema = baseEventSchema.extend({
  type: z.literal("tool.called"),
  runId: z.string(),
  toolCallId: z.string(),
  toolName: z.string(),
  input: z.unknown()
});

const toolCompletedSchema = baseEventSchema.extend({
  type: z.literal("tool.completed"),
  runId: z.string(),
  toolCallId: z.string(),
  output: z.unknown()
});

const toolFailedSchema = baseEventSchema.extend({
  type: z.literal("tool.failed"),
  runId: z.string(),
  toolCallId: z.string(),
  error: z.string()
});

const approvalRequestedSchema = baseEventSchema.extend({
  type: z.literal("approval.requested"),
  runId: z.string(),
  approvalId: z.string(),
  actionLabel: z.string(),
  reason: z.string().optional()
});

const approvalResolvedSchema = baseEventSchema.extend({
  type: z.literal("approval.resolved"),
  runId: z.string(),
  approvalId: z.string(),
  decision: z.enum(["approved", "rejected"])
});

const errorSchema = baseEventSchema.extend({
  type: z.literal("error"),
  error: z.string()
});

export const agentEventSchema = z.discriminatedUnion("type", [
  runStartedSchema,
  runCompletedSchema,
  runFailedSchema,
  messageCreatedSchema,
  messageDeltaSchema,
  toolCalledSchema,
  toolCompletedSchema,
  toolFailedSchema,
  approvalRequestedSchema,
  approvalResolvedSchema,
  errorSchema
]);

export const eventBatchSchema = z.array(agentEventSchema);
