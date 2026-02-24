# Створення нової NestJS Feature — Покроковий гайд

## Передумови

- Проєкт використовує **NestJS 11**, **Prisma 7**, **Joi** (валідація), **JWT** (авторизація)
- Патерн: **Controller → Service → Repository → Prisma**
- Усі відповіді загортаються в `SuccessResponse` через `ResponseInterceptor`

---

## Чек-лист

### 1. Prisma Model

**Файл:** `prisma/schema.prisma`

```prisma
model Feature {
  id          String   @id @default(uuid())
  name        String
  description String?

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  createdById String @map("created_by_id")
  createdBy   User   @relation("CreatedFeatures", fields: [createdById], references: [id], onDelete: Cascade)

  @@index([createdById])
  @@map("features")
}
```

> [!IMPORTANT]
> Не забудь додати зворотнє відношення в модель `User`:
>
> ```prisma
> createdFeatures Feature[] @relation("CreatedFeatures")
> ```

Після змін:

```bash
npm run db:migrate:dev -- --name add-feature
npm run client:generate
```

---

### 2. Entity (TypeScript тип)

**Файл:** `src/modules/feature/feature.entity.ts`

```typescript
import { Feature } from '../../../generated/prisma';

export type FeatureEntity = Feature;
```

---

### 3. DTOs

**Файл:** `src/modules/feature/dtos/create-feature.dto.ts`

```typescript
export class CreateFeatureDto {
  name: string;
  description?: string;
  createdById: string;
}
```

**Файл:** `src/modules/feature/dtos/update-feature.dto.ts`

```typescript
export class UpdateFeatureDto {
  name?: string;
  description?: string;
}
```

---

### 4. Joi Validation Schemas

**Файл:** `src/modules/feature/schemas/create-feature.schema.ts`

```typescript
import * as Joi from 'joi';

export const createFeatureSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  description: Joi.string().max(1000).optional(),
});
```

**Файл:** `src/modules/feature/schemas/update-feature.schema.ts`

```typescript
import * as Joi from 'joi';

export const updateFeatureSchema = Joi.object({
  name: Joi.string().min(1).max(255).optional(),
  description: Joi.string().max(1000).optional().allow(null),
});
```

---

### 5. Repository

**Файл:** `src/modules/feature/feature.repository.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '../../../generated/prisma';
import { CreateFeatureDto } from './dtos/create-feature.dto';
import { UpdateFeatureDto } from './dtos/update-feature.dto';

@Injectable()
export class FeatureRepository {
  private readonly repo: Prisma.FeatureDelegate;

  constructor(db: DatabaseService) {
    this.repo = db.feature;
  }

  async create(data: CreateFeatureDto) {
    return this.repo.create({ data });
  }

  async findById(id: string) {
    return this.repo.findUnique({ where: { id } });
  }

  async findPageable(skip: number, take: number) {
    return this.repo.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count() {
    return this.repo.count();
  }

  async update(id: string, data: UpdateFeatureDto) {
    return this.repo.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.repo.delete({ where: { id } });
  }
}
```

---

### 6. Service

**Файл:** `src/modules/feature/feature.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { FeatureRepository } from './feature.repository';
import { CreateFeatureDto } from './dtos/create-feature.dto';
import { UpdateFeatureDto } from './dtos/update-feature.dto';
import { checkExists } from '../../utils';

@Injectable()
export class FeatureService {
  constructor(private readonly featureRepository: FeatureRepository) {}

  async findByIdOrThrow(id: string) {
    return checkExists(
      this.featureRepository.findById(id),
      'Feature not found',
    );
  }

  async findPageable(pageRequest: { skip: number; take: number }) {
    const [items, totalCount] = await Promise.all([
      this.featureRepository.findPageable(pageRequest.skip, pageRequest.take),
      this.featureRepository.count(),
    ]);
    return { items, totalCount };
  }

  async create(dto: CreateFeatureDto) {
    return this.featureRepository.create(dto);
  }

  async update(id: string, dto: UpdateFeatureDto) {
    await this.findByIdOrThrow(id);
    return this.featureRepository.update(id, dto);
  }

  async delete(id: string) {
    await this.findByIdOrThrow(id);
    return this.featureRepository.delete(id);
  }
}
```

---

### 7. Controller

**Файл:** `src/modules/feature/feature.controller.ts`

```typescript
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { FeatureService } from './feature.service';
import { CreateFeatureDto } from './dtos/create-feature.dto';
import { UpdateFeatureDto } from './dtos/update-feature.dto';
import { ResponseMessage, UserDetails } from '../../decorators';
import { AuthGuard } from '../../guards/user.guard';
import { ValidationPipe } from '../../pipes/validation.pipe';
import { createFeatureSchema } from './schemas/create-feature.schema';
import { updateFeatureSchema } from './schemas/update-feature.schema';
import { uuidSchema } from '../../schemas/uuid.schema';
import { UserEntity } from '../user/user.entity';

@ApiTags('Features')
@ApiBearerAuth()
@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all features with pagination' })
  @ApiResponse({ status: 200, description: 'Features retrieved' })
  @ResponseMessage('Features retrieved successfully')
  async getAll(@Query() query: { page?: number; take?: number }) {
    const page = query.page ?? 1;
    const take = query.take ?? 20;
    return this.featureService.findPageable({ skip: (page - 1) * take, take });
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ApiParam({ name: 'id', description: 'Feature ID' })
  @ResponseMessage('Feature found successfully')
  async getById(@Param('id', new ValidationPipe(uuidSchema)) id: string) {
    return this.featureService.findByIdOrThrow(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ResponseMessage('Feature created successfully')
  async create(
    @Body(new ValidationPipe(createFeatureSchema)) dto: CreateFeatureDto,
    @UserDetails() user: UserEntity,
  ) {
    dto.createdById = user.id;
    return this.featureService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @ResponseMessage('Feature updated successfully')
  async update(
    @Param('id', new ValidationPipe(uuidSchema)) id: string,
    @Body(new ValidationPipe(updateFeatureSchema)) dto: UpdateFeatureDto,
  ) {
    return this.featureService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ResponseMessage('Feature deleted successfully')
  async delete(@Param('id', new ValidationPipe(uuidSchema)) id: string) {
    return this.featureService.delete(id);
  }
}
```

---

### 8. Module

**Файл:** `src/modules/feature/feature.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';
import { FeatureRepository } from './feature.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FeatureController],
  providers: [FeatureService, FeatureRepository],
  exports: [FeatureService],
})
export class FeatureModule {}
```

---

### 9. Зареєструвати в AppModule

**Файл:** `src/app.module.ts`

```typescript
import { FeatureModule } from './modules/feature/feature.module';

@Module({
  imports: [
    // ... existing modules
    FeatureModule, // ← додати
  ],
})
export class AppModule {}
```

---

### 10. Тести

**Unit тести** — `src/modules/feature/feature.service.spec.ts`, `feature.repository.spec.ts`, `feature.controller.spec.ts`

**E2E тести** — `test/e2e/feature.e2e-spec.ts`

Мінімальний unit тест:

```typescript
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { FeatureService } from './feature.service';
import { FeatureRepository } from './feature.repository';

describe('FeatureService', () => {
  let service: FeatureService;
  let repository: jest.Mocked<FeatureRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        FeatureService,
        {
          provide: FeatureRepository,
          useValue: createMock<FeatureRepository>(),
        },
      ],
    }).compile();

    service = module.get(FeatureService);
    repository = module.get(FeatureRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
```

---

## Фінальна структура файлів

```
src/modules/feature/
├── feature.module.ts
├── feature.controller.ts
├── feature.service.ts
├── feature.repository.ts
├── feature.entity.ts
├── feature.controller.spec.ts
├── feature.service.spec.ts
├── feature.repository.spec.ts
├── dtos/
│   ├── create-feature.dto.ts
│   └── update-feature.dto.ts
└── schemas/
    ├── create-feature.schema.ts
    └── update-feature.schema.ts
```

## ⚠️ Checklist перед PR

- [ ] Prisma model додано + міграція створена
- [ ] `npm run client:generate` виконано
- [ ] Entity type створено
- [ ] DTOs створено (create, update)
- [ ] Joi schemas створено (create, update)
- [ ] Repository створено з CRUD методами
- [ ] Service створено з `checkExists` для find-or-throw
- [ ] Controller створено з `@UseGuards(AuthGuard)`, `@ResponseMessage()`, `@ValidationPipe()`
- [ ] Module створено та зареєстрований в `AppModule`
- [ ] Unit тести написано (service, repository, controller)
- [ ] Swagger декоратори додано (`@ApiTags`, `@ApiOperation`, `@ApiBearerAuth`)
- [ ] `npm run start:dev` працює без помилок
- [ ] `npm test` проходить
