import bcrypt from "bcryptjs";

type UserProps = {
  id: number;
  email: string;
  password: string;
};

export class User {
  id: number;
  email: string;
  private password: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
  }

  async verifyPassword(plain: string) {
    return bcrypt.compare(plain, this.password);
  }
}
