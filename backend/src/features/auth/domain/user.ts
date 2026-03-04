import bcrypt from "bcrypt";

type UserProps = {
  id: string;
  email: string;
  password: string;
};

export class User {
  id: string;
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
