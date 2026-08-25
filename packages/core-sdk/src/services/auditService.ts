import type { AuditLogRecord, FireAccessListResult } from "@fireaccess/types";
import type { NormalizedFireAccessConfig } from "../types/config";
import { connectMongo } from "../mongodb/connection";
import { AuditModel } from "../mongodb/audit.model";
import type { AuditLogDocument } from "../mongodb/audit.model";

export interface ListAuditLogsOptions {
  page?: number;
  limit?: number;
  action?: string;
  performedBy?: string;
  search?: string;
}

const normalizePage = (page?: number): number =>
  Number.isInteger(page) && page && page > 0 ? page : 1;

const normalizeLimit = (limit?: number): number => {
  if (!Number.isInteger(limit) || !limit || limit < 1) {
    return 25;
  }

  return Math.min(limit, 100);
};

const toAuditLogRecord = (document: AuditLogDocument): AuditLogRecord => {
  const record = document.toObject();

  return {
    id: String(document._id),
    action: record.action,
    performedBy: record.performedBy,
    target: record.target,
    metadata: record.metadata ?? {},
    timestamp: record.timestamp,
  };
};

export class FireAccessAuditService {
  public constructor(private readonly config: NormalizedFireAccessConfig) {}

  public async listAuditLogs(
    options: ListAuditLogsOptions = {},
  ): Promise<FireAccessListResult<AuditLogRecord>> {
    await connectMongo(this.config.mongoUri, this.config.mongoOptions);

    const page = normalizePage(options.page);
    const limit = normalizeLimit(options.limit);
    const query: Record<string, unknown> = {};

    if (options.action?.trim()) {
      query.action = { $regex: options.action.trim(), $options: "i" };
    }

    if (options.performedBy?.trim()) {
      query.performedBy = options.performedBy.trim();
    }

    if (options.search?.trim()) {
      const search = options.search.trim();
      query.$or = [
        { action: { $regex: search, $options: "i" } },
        { performedBy: { $regex: search, $options: "i" } },
        { target: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      AuditModel.find(query)
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      AuditModel.countDocuments(query).exec(),
    ]);

    return {
      items: items.map((item) => toAuditLogRecord(item)),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  public async record(
    action: string,
    input: {
      performedBy?: string;
      target?: string;
      metadata?: Record<string, unknown>;
    } = {},
  ): Promise<AuditLogRecord> {
    await connectMongo(this.config.mongoUri, this.config.mongoOptions);
    const created = await AuditModel.create({
      action,
      performedBy: input.performedBy,
      target: input.target,
      metadata: input.metadata ?? {},
      timestamp: new Date(),
    });

    return toAuditLogRecord(created);
  }
}
