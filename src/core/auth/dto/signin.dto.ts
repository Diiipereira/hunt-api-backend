import { PickType } from '@nestjs/swagger';
import { SignupDto } from 'src/modules/users/dto/signup.dto';

export class SigninDto extends PickType(SignupDto, [
  'email',
  'password',
] as const) {}
