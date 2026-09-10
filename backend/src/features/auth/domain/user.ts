import { findUserByFirebaseUid } from "../repository";
import type { RoleName } from "../types/schemas";

type UserProps = {
  id: number;
  email: string;
  firebaseUid: string;
  isDelete: boolean;
  roleId: number;
  role: { name: RoleName };
};

// ユーザーのアクティブレコード
export class User {
  private _id: number;
  private _email: string;
  private _firebaseUid: string;
  private _isDelete: boolean;
  private _roleId: number;
  private _roleName: RoleName;

  private constructor(props: UserProps) {
    this._id = props.id;
    this._email = props.email;
    this._firebaseUid = props.firebaseUid;
    this._isDelete = props.isDelete;
    this._roleId = props.roleId;
    this._roleName = props.role.name;
  };

  get id(): number { return this._id };
  get email(): string { return this._email };
  get roleId(): number { return this._roleId };
  get roleName(): RoleName { return this._roleName };

  // 業務ロジック
  static async findByFirebaseUid(uid: string): Promise<User | null> {
    const row = await findUserByFirebaseUid(uid);
    return row ? new User({ ...row, role: { name: row.role.name as RoleName } }) : null;
  };

  // 業務ロジック
  public isActive(): boolean {
    return !this._isDelete;
  };
}
