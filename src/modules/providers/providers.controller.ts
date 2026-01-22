import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Body,
  ParseUUIDPipe,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateProviderDto } from './dto/create-provider.dto';
import { ProvidersService } from './providers.service';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { Roles } from 'src/core/auth/decorators/roles.decorator';
import { UserRole } from 'generated/prisma/client';
import { RolesGuard } from 'src/core/auth/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CacheInterceptor } from 'src/common/interceptors/cache.interceptor';

@ApiTags('Providers')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'List all providers' })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of providers retrieved successfully.',
  })
  async findAllProviders(@Query('active') active: string) {
    return this.providersService.findAllProviders(active);
  }

  @Post('create')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new provider (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'The provider has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Admin role.' })
  async createProvider(@Body() createProviderDto: CreateProviderDto) {
    return this.providersService.createProvider(createProviderDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a provider (Admin only)' })
  @ApiParam({ name: 'id', description: 'Provider UUID' })
  @ApiResponse({
    status: 200,
    description: 'The provider has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Provider not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Admin role.' })
  async updateProvider(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProviderDto: UpdateProviderDto,
  ) {
    return this.providersService.updateProvider(id, updateProviderDto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle provider active status (Admin only)' })
  @ApiParam({ name: 'id', description: 'Provider UUID' })
  @ApiResponse({
    status: 200,
    description: 'Provider status updated successfully.',
  })
  @ApiResponse({ status: 404, description: 'Provider not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Admin role.' })
  async activateProvider(@Param('id', ParseUUIDPipe) id: string) {
    return this.providersService.activateProvider(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Soft delete a provider (Admin only)' })
  @ApiParam({ name: 'id', description: 'Provider UUID' })
  @ApiResponse({
    status: 200,
    description: 'Provider has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Provider not found.' })
  @ApiResponse({ status: 403, description: 'Forbidden. Requires Admin role.' })
  async softDeleteProvider(@Param('id', ParseUUIDPipe) id: string) {
    return this.providersService.softDeleteProvider(id);
  }
}
