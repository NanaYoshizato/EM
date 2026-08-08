import { findUserByFirebaseUid } from "../repository";

type UserProps = {
  id: number;
  email: string;
  firebaseUid: string;
  isDelete: boolean;
};

// ユーザーのアクティブレコード
export class User {
  private _id: number;
  private _email: string;
  private _firebaseUid: string;
  private _isDelete: boolean;

  private constructor(props: UserProps) {
    this._id = props.id;
    this._email = props.email;
    this._firebaseUid = props.firebaseUid;
    this._isDelete = props.isDelete;
  };

  get id(): number { return this._id };
  get email(): string { return this._email };

  // 業務ロジック
  static async findByFirebaseUid(uid: string): Promise<User | null> {
    const row = await findUserByFirebaseUid(uid);
    return row ? new User(row) : null;
  };

  // 業務ロジック
  public isActive(): boolean {
    return !this._isDelete;
  };
}
