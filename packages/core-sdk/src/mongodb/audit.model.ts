import mongoose from "mongoose";
import type { HydratedDocument, Model } from "mongoose";

const { Schema, model, models } = mongoose;

export interface AuditLogRecord {
  action: string;
  performedBy?: string;
  target?: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

export type AuditLogDocument = HydratedDocument<AuditLogRecord>;

const auditSchema = new Schema<AuditLogRecord>(
  {
    action: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    performedBy: {
      type: String,
      trim: true,
      index: true,
    },
    target: {
      type: String,
      trim: true,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    collection: "fireaccess_audit_logs",
    versionKey: false,
  },
);

auditSchema.index({ action: 1, timestamp: -1 });
auditSchema.index({ performedBy: 1, timestamp: -1 });
auditSchema.index({ target: 1, timestamp: -1 });

export const AuditModel =
  (models.FireAccessAuditLog as Model<AuditLogRecord> | undefined) ??
  model<AuditLogRecord>("FireAccessAuditLog", auditSchema);
