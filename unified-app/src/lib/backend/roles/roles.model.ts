import { model, Schema, Document } from 'mongoose';
import { Role, UserRole, Permission } from '@backend/roles/roles.interface';
const roleSchema = new Schema<Role>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    permissions: [
      {
        type: String,
        enum: Object.values(Permission),
        required: true,
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);
const userRoleSchema = new Schema<UserRole>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    roleId: {
      type: String,
      ref: 'Role',
      required: true,
    },
    assignedBy: {
      type: String,
      ref: 'User',
      required: true,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);
userRoleSchema.index({ userId: 1, roleId: 1 }, { unique: true });
export const RoleModel = model<Role & Document>('Role', roleSchema);
export const UserRoleModel = model<UserRole & Document>('UserRole', userRoleSchema);