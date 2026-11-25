import { findUserByFirebaseUid } from "../repository";
import type { RoleName } from "../types/schemas";

type UserProps = {
  id: number;
  email: string;
  firebaseUid: string;
  isDelete: boolean;
  roleId: number;
  role: { name: RoleName; label: string };
  employeeId: number | null;
};

// ユーザーのアクティブレコード
export class User {
  private _id: number;
  private _email: string;
  private _firebaseUid: string;
  private _isDelete: boolean;
  private _roleId: number;
  private _roleName: RoleName;
  private _roleLabel: string;
  private _employeeId: number | null;

  private constructor(props: UserProps) {
    this._id = props.id;
    this._email = props.email;
    this._firebaseUid = props.firebaseUid;
    this._isDelete = props.isDelete;
    this._roleId = props.roleId;
    this._roleName = props.role.name;
    this._roleLabel = props.role.label;
    this._employeeId = props.employeeId;
  };

  get id(): number { return this._id };
  get email(): string { return this._email };
  get roleId(): number { return this._roleId };
  get roleName(): RoleName { return this._roleName };
  get roleLabel(): string { return this._roleLabel };
  /** 紐づく社員のid（社員が無い・論理削除済みならnull） */
  get employeeId(): number | null { return this._employeeId };

  // 業務ロジック
  static async findByFirebaseUid(uid: string): Promise<User | null> {
    const row = await findUserByFirebaseUid(uid);
    return row
      ? new User({
          ...row,
          role: { name: row.role.name as RoleName, label: row.role.label },
          employeeId: row.employee && !row.employee.isDelete ? row.employee.id : null,
        })
      : null;
  };

  // 業務ロジック
  public isActive(): boolean {
    return !this._isDelete;
  };
}
