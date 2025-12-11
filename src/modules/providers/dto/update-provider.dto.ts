import { PickType } from '@nestjs/mapped-types';
import { CreateProviderDto } from './create-provider.dto';

export class UpdateProviderDto extends PickType(CreateProviderDto, [
  'name',
] as const) {}
