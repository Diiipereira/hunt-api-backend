import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateProviderDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
