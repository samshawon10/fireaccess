import type {
  AuthenticatedUser,
  FireAccessAdminStats,
  FireAccessListResult,
  Permission,
  UserRole,
} from "@fireaccess/types";
import { FIREACCESS_ROLES } from "@fireaccess/types";
import type { NormalizedFireAccessConfig } from "../types/config";
import { isValidRole } from "../core/roles";
import { connectMongo } from "../mongodb/connection";
import { AuditModel } from "../mongodb/audit.model";
import { UserModel, toAuthenticatedUser } from "../mongodb/user.model";
import { NotFoundError, ValidationError } from "../utils/errors";

export interface ListUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserAccessInput {
  role?: UserRole;
  permissions?: Permission[];
  isActive?: boolean;
}

const normalizePage = (page?: number): number =>
  Number.isInteger(page) && page && page > 0 ? page : 1;

const normalizeLimit = (limit?: number): number => {
  if (!Number.isInteger(limit) || !limit || limit < 1) {
    return 25;
  }

  return Math.min(limit, 100);
};

const normalizePermissionsForWrite = (permissions: Permission[]): Permission[] => {
  const normalized = [
    ...new Set(
      permissions
        .filter((permission) => typeof permission === "string")
        .map((permission) => permission.trim())
        .filter(Boolean),
    ),
  ];

  if (normalized.length !== permissions.length) {
    throw new ValidationError("Permissions must be non-empty strings.");
  }

  return normalized;
};

export class FireAccessUserService {
  public constructor(private readonly config: NormalizedFireAccessConfig) {}

  public async listUsers(
    options: ListUsersOptions = {},
  ): Promise<FireAccessListResult<AuthenticatedUser>> {
    await connectMongo(this.config.mongoUri, this.config.mongoOptions);

    const page = normalizePage(options.page);
    const limit = normalizeLimit(options.limit);
    const query: Record<string, unknown> = {};

    if (options.role) {
      if (!isValidRole(options.role)) {
        throw new ValidationError("Invalid role filter.");
      }

      query.role = options.role;
    }

    if (typeof options.isActive === "boolean") {
      query.isActive = options.isActive;
    }

    if (options.search?.trim()) {
      const search = options.search.trim();
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { displayName: { $regex: search, $options: "i" } },
        { uid: { $regex: search, $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      UserModel.find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      UserModel.countDocuments(query).exec(),
    ]);

    return {
      items: items.map(toAuthenticatedUser),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  public async getUser(uid: string): Promise<AuthenticatedUser> {
    await connectMongo(this.config.mongoUri, this.config.mongoOptions);
    const user = await UserModel.findOne({ uid }).exec();

    if (!user) {
      throw new NotFoundError("FireAccess user not found.");
    }

    return toAuthenticatedUser(user);
  }

  public async updateUserAccess(
    uid: string,
    input: UpdateUserAccessInput,
  ): Promise<AuthenticatedUser> {
    await connectMongo(this.config.mongoUri, this.config.mongoOptions);

    const update: Partial<UpdateUserAccessInput> = {};

    if (input.role !== undefined) {
      if (!isValidRole(input.role)) {
        throw new ValidationError("Invalid user role.");
      }

      update.role = input.role;
    }

    if (input.permissions !== undefined) {
      if (!Array.isArray(input.permissions)) {
        throw new ValidationError("Permissions must be an array.");
      }

      update.permissions = normalizePermissionsForWrite(input.permissions);
    }

    if (input.isActive !== undefined) {
      if (typeof input.isActive !== "boolean") {
        throw new ValidationError("isActive must be a boolean.");
      }

      update.isActive = input.isActive;
    }

    const user = await UserModel.findOneAndUpdate({ uid }, { $set: update }, {
      new: true,
      runValidators: true,
    }).exec();

    if (!user) {
      throw new NotFoundError("FireAccess user not found.");
    }

    return toAuthenticatedUser(user);
  }

  public async getStats(): Promise<FireAccessAdminStats> {
    await connectMongo(this.config.mongoUri, this.config.mongoOptions);

    const [totalUsers, activeUsers, groupedRoles, auditEventsLast24h] =
      await Promise.all([
        UserModel.countDocuments().exec(),
        UserModel.countDocuments({ isActive: true }).exec(),
        UserModel.aggregate<{ _id: UserRole; count: number }>([
          { $group: { _id: "$role", count: { $sum: 1 } } },
        ]).exec(),
        AuditModel.countDocuments({
          timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        }).exec(),
      ]);

    const roles = Object.fromEntries(
      FIREACCESS_ROLES.map((role) => [role, 0]),
    ) as FireAccessAdminStats["roles"];

    for (const item of groupedRoles) {
      roles[item._id] = item.count;
    }

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      roles,
      auditEventsLast24h,
    };
  }
}
