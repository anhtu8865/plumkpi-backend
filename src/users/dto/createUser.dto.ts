export class CreateUserDto {
  user_name: string;
  email: string;
  password: string;
  role: string;
  is_active: boolean;
}

export default CreateUserDto;