EMS Backend — Architecture
File Size: ~900 lines (~4,000 tokens)
Token-Saving Tip: Load only the "🤖 LLM Quick Reference" section first (~80 lines), then load specific sections as needed

📑 Table of Contents & Loading Priority
Section Lines Priority Load When
🤖 LLM Quick Reference 5-85 🔴 MUST READ First time / unfamiliar with codebase
Common Tasks Implementation 250-400 🔴 MUST READ Adding features
Database Schema 420-530 🟡 REFERENCE Understanding data model

> **📖 Повна документація БД:** [DATABASE.md](file:///Users/rostyslavpasternak/Desktop/ems/backend/docs/DATABASE.md)
> API Structure 535-600 🟡 REFERENCE Creating endpoints
> Security Features 605-680 🟡 REFERENCE Implementing auth
> Performance Optimization 685-780 🟡 REFERENCE Optimizing code
> Common Gotchas 785-870 🟡 REFERENCE Troubleshooting
> Full Tech Stack 100-160 🟢 OPTIONAL Need full details
> Data Flow Diagrams 310-400 🟢 OPTIONAL Understanding flows
> Testing Strategy 620-680 🟢 OPTIONAL Writing tests
> Recommended:

First time: Load 🔴 sections (~200 lines)
Specific task: Load relevant 🟡 sections (~200 lines)
Deep dive: Load 🟢 sections as needed
🤖 LLM Quick Reference (Read This First)
What is this app? An Event Management System (EMS) for creating, managing, and discovering events. Users can register, create events with categories, attend events, and receive recommendations for similar events based on category, location, time proximity, and collaborative filtering.

Key Domain Terms
Term Meaning Database Entity
Event An event with title, description, date, location events
Category A tag/group for organizing events categories
Attendance A record of a user attending an event Attendance (no @@map)
User A registered user of the platform users
Where to Find Code
I need to... Look in...
Add a new feature (full guide) docs/NEW-FEATURE-GUIDE.md
Add a new API endpoint src/modules/{feature}/
Add a database model prisma/schema.prisma
Database guide (full) docs/DATABASE.md
Add a migration Run `prisma migrate dev`
Add shared utility src/utils/
Add validation schema src/modules/{feature}/schemas/ or src/schemas/
Add a guard src/guards/
Add a filter src/filters/
Add an interceptor src/interceptors/
Add a decorator src/decorators/
Add a pipe src/pipes/
Critical Implementation Rules
Always use the Repository pattern — Controllers → Services → Repositories → Prisma
Use Joi schemas for validation via custom `ValidationPipe`, not class-validator decorators
All responses are wrapped by `ResponseInterceptor` into `SuccessResponse({ data, message, statusCode })`
Use `@ResponseMessage('...')` decorator on controller methods to set response message
UUID validation — use `uuidSchema` from `src/schemas/uuid.schema.ts` for param validation
Use `checkExists()` utility for "find or throw 404" patterns
Pagination — use `PageRequest` / `PageResponse` utilities from `src/utils/pageables/`
Performance Targets (Non-Negotiable)
Layer Operation Target
Backend Simple API < 100ms
Backend Complex API < 500ms
Database Simple query < 10ms
Database Complex query < 100ms
Common Implementation Patterns

```typescript
// Backend: Standard service method
async findEventByIdOrThrow(eventId: string) {
  return checkExists(
    this.eventRepository.findEventById(eventId),
    'Event not found',
  );
}

// Backend: Paginated list with filters
async findPageableEvents(pageRequest: EventFilterDto) {
  const [events, totalCount] = await Promise.all([
    this.eventRepository.findPageableEvents(pageRequest),
    this.eventRepository.countEvents(pageRequest),
  ]);
  return pageRequest.toPageResponse(events, totalCount);
}

// Backend: Repository method with Prisma
async findEventById(eventId: string) {
  return this.eventRepository.findUnique({
    where: { id: eventId },
    include: {
      category: true,
      createdBy: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });
}
```

Overview
EMS (Event Management System) is a REST API backend built with NestJS and Prisma ORM. It provides event management, user authentication, category management, attendance tracking, and an intelligent event recommendation engine.

The system follows a modular, layered architecture with clear separation between controllers, services, and repositories. It uses PostgreSQL for persistence, Redis for caching, JWT for authentication, and Joi for request validation.

Architecture Pattern
Modular NestJS Architecture — Feature-based modules with Controller → Service → Repository layering. Each module encapsulates its own business logic, DTOs, schemas, and data access.

```
graph TB
    A[Clients] -->|HTTPS| B[NestJS API]
    B --> C[PostgreSQL via Prisma]
    B --> D[Redis Cache]
    B --> E[Swagger UI]
    B --> F[Auth Guard]
    F --> G[JWT Token Service]
```

Technology Stack
Component Technology Purpose
Framework NestJS 11.0.1 Progressive Node.js framework
ORM Prisma 7.0.1 Type-safe database access
Database PostgreSQL Primary data storage
Cache Redis (cache-manager-redis-yet) Response caching
Authentication JWT (@nestjs/jwt 11.0.1) Token-based auth
Password Hashing bcrypt 6.0.0 Secure password storage
Validation Joi 18.x Schema-based request validation
Serialization class-transformer 0.5.1 DTO transformation
API Docs @nestjs/swagger 11.2.3 Swagger/OpenAPI documentation
Config @nestjs/config 4.0.2 Environment variable management
Testing Jest 30.0.0, Supertest 7.0.0 Unit, integration, E2E tests
Containers Testcontainers 11.12.0 Isolated test databases
Performance Artillery, k6 Load testing
Language TypeScript 5.7.3 Type safety
Project Structure

```
backend/
├── docs/
│   ├── ARCHITECTURE.md                  # This file — system architecture
│   ├── DATABASE.md                      # Database schema, migrations, seeds guide
│   └── NEW-FEATURE-GUIDE.md             # Step-by-step guide for new features
├── prisma/
│   └── schema.prisma                    # Database schema definition
├── generated/
│   └── prisma/                          # Generated Prisma Client
├── src/
│   ├── main.ts                          # Application entry point
│   ├── app.module.ts                    # Root module
│   ├── configs/
│   │   └── swagger.config.ts            # Swagger setup
│   ├── schemas/
│   │   ├── env.schema.ts                # Environment variable validation (Joi)
│   │   ├── page-request.schema.ts       # Pagination schema
│   │   └── uuid.schema.ts              # UUID param validation
│   ├── enums/
│   │   ├── node-env.enum.ts             # Environment enum
│   │   └── sort-order.ts               # Sort order enum
│   ├── decorators/
│   │   ├── is-public.decorator.ts       # Mark route as public
│   │   ├── response-message.decorator.ts # Set response message
│   │   └── user-details.decorator.ts    # Extract user from request
│   ├── guards/
│   │   └── user.guard.ts                # JWT AuthGuard
│   ├── filters/
│   │   ├── global.filter.ts             # Catch-all filter
│   │   ├── error.filter.ts              # Error filter
│   │   ├── exception.filter.ts          # NestJS exception filter
│   │   └── i-exception.filter.ts        # Custom exception filter
│   ├── interceptors/
│   │   └── response.interceptor.ts      # Wraps responses in SuccessResponse
│   ├── pipes/
│   │   ├── global.pipe.ts               # Global validation pipe
│   │   └── validation.pipe.ts           # Joi-based validation pipe
│   ├── middlewares/
│   │   └── http-logger.middleware.ts     # HTTP request logging
│   ├── utils/
│   │   ├── constants.utils.ts           # App constants
│   │   ├── existence/                   # checkExists utility
│   │   ├── pageables/                   # PageRequest, PageResponse
│   │   └── responses/                   # SuccessResponse, ErrorResponse
│   └── modules/
│       ├── database/                    # Prisma database connection
│       ├── cache/                       # Redis cache service
│       ├── auth/                        # Authentication (login, register, refresh)
│       ├── token/                       # JWT token generation & verification
│       ├── user/                        # User management & profile
│       ├── event/                       # Event CRUD & filtering
│       │   └── recommendation/          # Event recommendation engine
│       ├── category/                    # Event categories
│       └── attendance/                  # User-event attendance tracking
├── test/
│   ├── e2e/                             # E2E tests (Testcontainers + Supertest)
│   ├── integration/                     # Integration tests
│   ├── performance/                     # Artillery/k6 load tests
│   └── utils/                           # Test utilities
├── Dockerfile                           # Container definition
└── package.json                         # Dependencies & scripts
```

Layer Responsibilities
Request Pipeline (Global)
HttpLoggerMiddleware → Logs all incoming requests
AuthGuard → Validates JWT token from Authorization header, attaches `req.user`
ValidationPipe (Joi) → Validates request body/query/params against Joi schema
Controllers → Route handling, calls service methods
ResponseInterceptor → Wraps response in `SuccessResponse({ data, message, statusCode })`
Exception Filters → `GlobalFilter` → `ErrorFilter` → `ExceptionFilter` (ordered catch chain)

Backend Modules
Module Responsibility Key Files
Database Prisma Client connection (extends PrismaClient) database.service.ts, database.module.ts
Cache Redis caching with `getOrSet`, `get`, `set`, `del` cache.service.ts, cache.module.ts
Auth Login, register, refresh token auth.controller.ts, auth.service.ts
Token JWT generation/verification (access + refresh) token.service.ts, payload.mapper.ts
User User CRUD, profile (/me endpoints) me.controller.ts, user.service.ts, user.repository.ts
Event Event CRUD, filtering (Builder pattern), pagination event.controller.ts, event.service.ts, event.repository.ts, event-filter.builder.ts
Event Recommendation Smart event recommendations (Strategy pattern) event-recommendation.service.ts, strategies/
Category Event category management category.controller.ts, category.service.ts, category.repository.ts
Attendance User-event attendance tracking attendance.controller.ts, attendance.service.ts, attendance.repository.ts

📋 Common Tasks Implementation Guide
Adding a New Backend Feature (Module)

> **📖 Повний покроковий гайд з шаблонами коду:** [NEW-FEATURE-GUIDE.md](file:///Users/rostyslavpasternak/Desktop/ems/backend/docs/NEW-FEATURE-GUIDE.md)

Короткий огляд кроків:

```bash
# 1. Додати Prisma model в prisma/schema.prisma
# 2. Створити міграцію та згенерувати клієнт
prisma migrate dev --name add-feature-name
npm run client:generate

# 3. Створити файли модуля
# src/modules/feature-name/feature-name.entity.ts      — тип
# src/modules/feature-name/dtos/create-feature-name.dto.ts
# src/modules/feature-name/dtos/update-feature-name.dto.ts
# src/modules/feature-name/schemas/create-feature-name.schema.ts  — Joi
# src/modules/feature-name/schemas/update-feature-name.schema.ts  — Joi
# src/modules/feature-name/feature-name.repository.ts  — Prisma queries
# src/modules/feature-name/feature-name.service.ts     — бізнес-логіка
# src/modules/feature-name/feature-name.controller.ts  — REST endpoints
# src/modules/feature-name/feature-name.module.ts      — NestJS module

# 4. Зареєструвати FeatureModule в app.module.ts
# 5. Написати тести
```

Standard Module Files Structure

```
src/modules/{feature}/
├── {feature}.module.ts          # NestJS module definition
├── {feature}.controller.ts      # REST endpoints with Swagger decorators
├── {feature}.service.ts         # Business logic
├── {feature}.repository.ts      # Data access via Prisma
├── {feature}.entity.ts          # TypeScript type (mirrors Prisma model)
├── dtos/                        # Data Transfer Objects
│   ├── create-{feature}.dto.ts
│   └── update-{feature}.dto.ts
└── schemas/                     # Joi validation schemas
    ├── create-{feature}.schema.ts
    └── update-{feature}.schema.ts
```

Standard Controller Pattern

```typescript
@ApiTags('FeatureName')
@ApiBearerAuth()
@Controller('feature-name')
export class FeatureNameController {
  constructor(private readonly featureNameService: FeatureNameService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get all items with pagination' })
  @ApiResponse({ status: 200, description: 'Items retrieved' })
  @ResponseMessage('Items retrieved successfully')
  async getItems(@Query(new ValidationPipe(querySchema)) query: QueryDto) {
    return this.featureNameService.findPageable(query);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ResponseMessage('Item created successfully')
  async createItem(
    @Body(new ValidationPipe(createSchema)) dto: CreateDto,
    @UserDetails() user: UserEntity,
  ) {
    dto.createdById = user.id;
    return this.featureNameService.create(dto);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  @ResponseMessage('Item found successfully')
  async getById(@Param('id', new ValidationPipe(uuidSchema)) id: string) {
    return this.featureNameService.findByIdOrThrow(id);
  }
}
```

Standard Repository Pattern

```typescript
@Injectable()
export class FeatureNameRepository {
  private readonly repo: Prisma.FeatureNameDelegate;

  constructor(db: DatabaseService) {
    this.repo = db.featureName;
  }

  async create(data: CreateDto) {
    return this.repo.create({ data });
  }

  async findById(id: string) {
    return this.repo.findUnique({
      where: { id },
      include: {
        /* relations */
      },
    });
  }

  async findPageable(filter: FilterDto) {
    return this.repo.findMany({
      where: {
        /* filter conditions */
      },
      skip: filter.skip,
      take: filter.take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async count(filter: FilterDto) {
    return this.repo.count({
      where: {
        /* same filter */
      },
    });
  }
}
```

Decision Tree: Where to Put Code

```
Is it a new domain feature?
├── YES → src/modules/{feature}/
│         ├── Controller? → {feature}.controller.ts
│         ├── Business logic? → {feature}.service.ts
│         ├── Data access? → {feature}.repository.ts
│         ├── DTO? → dtos/
│         └── Validation? → schemas/
└── NO
    ├── Shared across modules?
    │   ├── Guard? → src/guards/
    │   ├── Filter? → src/filters/
    │   ├── Interceptor? → src/interceptors/
    │   ├── Pipe? → src/pipes/
    │   ├── Decorator? → src/decorators/
    │   ├── Enum? → src/enums/
    │   ├── Utility? → src/utils/
    │   └── Validation schema? → src/schemas/
    └── Configuration?
        ├── Env schema → src/schemas/env.schema.ts
        └── Swagger → src/configs/swagger.config.ts
```

Key Design Patterns
Modular Architecture
Feature Modules: Each domain has its own NestJS module
Separation of Concerns: Controller → Service → Repository layers
Dependency Injection: NestJS built-in DI container

Repository Pattern
Prisma Repositories: Each module wraps `DatabaseService` (PrismaClient) with a dedicated repository class
Type-safe: Uses generated Prisma delegate types (e.g., `Prisma.EventDelegate`)
Include relations: Explicit `include` for eager loading related data

Builder Pattern (Event Filtering)
`EventFilterBuilder` — fluent builder for constructing Prisma `where` and `orderBy` clauses
Methods: `addSearch()`, `addCategoryFilter()`, `addDateRangeFilter()`, `addSorting()`, `addRadiusFilter()`, `addExcludeEventIds()`, `addIncludeEventIds()`
Usage: `new EventFilterBuilder().addSearch('...').addCategoryFilter('...').build()`

Strategy Pattern (Event Recommendations)
`SimilarityStrategy` interface with `calculate(source, candidate): number`
Concrete strategies: `CategorySimilarityStrategy`, `LocationSimilarityStrategy`, `TimeSimilarityStrategy`
Weighted scoring pipeline: category (0.4) + location (0.3) + time (0.2) + collaborative filtering (0.1)
Collaborative filtering: Jaccard similarity between user attendance sets

Data Flow
User Registration/Login Flow

```
User submits credentials → POST /api/v1/auth/register or /login
AuthController validates via Joi schema (ValidationPipe)
AuthService hashes password (bcrypt) / compares credentials
TokenService generates access + refresh JWT tokens
ResponseInterceptor wraps response in SuccessResponse
```

Event CRUD Flow

```
User sends request → AuthGuard validates JWT
Controller validates params/body via ValidationPipe (Joi)
Service delegates to Repository
Repository executes Prisma query
Service returns result → ResponseInterceptor wraps response
```

Event Recommendation Flow

```
GET /api/v1/event-recommendation/:eventId?userId=...
1. Load current event
2. Build context: user attended events, similar users (Jaccard), their events
3. Generate candidates: same category, upcoming, nearby (geo), collaborative
4. Score candidates via strategy pipeline (category + location + time + collaborative)
5. Sort by score descending, return top N
```

Database Schema
Entity Relationship Diagram

```
┌──────────────┐          ┌──────────────┐
│    User      │──1:N────▶│   Event      │
│              │          │              │
│ id (UUID)    │          │ id (UUID)    │
│ firstName    │          │ title        │
│ lastName     │    ┌────▶│ description  │
│ email (uniq) │    │     │ startDate    │
│ password?    │    │     │ endDate      │
│ createdAt    │    │     │ location     │
│ updatedAt    │    │     │ latitude?    │
└──────┬───────┘    │     │ longitude?   │
       │            │     │ createdById  │◀──FK to User
       │            │     │ categoryId?  │◀──FK to Category
       │ 1:N        │     │ createdAt    │
       ▼            │     │ updatedAt    │
┌──────────────┐    │     └──────┬───────┘
│  Category    │    │            │
│              │────┘            │ 1:N
│ id (UUID)    │                 ▼
│ name         │          ┌──────────────┐
│ description? │          │ Attendance   │
│ createdById  │◀─FK User │              │
│ createdAt    │          │ id (UUID)    │
│ updatedAt    │          │ userId       │◀──FK to User
└──────────────┘          │ eventId      │◀──FK to Event
                          │ createdAt    │
                          │ updatedAt    │
                          └──────────────┘
```

Key Relationships
Parent Child Relationship FK Column Notes
User Event 1:N event.createdById User creates events
User Category 1:N category.createdById User creates categories
User Attendance 1:N attendance.userId User attends events
Event Attendance 1:N attendance.eventId Event has attendees
Category Event 1:N event.categoryId Category groups events (optional)

Database Indexes

```prisma
@@index([createdById])  // on Category and Event
@@index([categoryId])   // on Event
@@index([startDate])    // on Event
```

Table Name Mapping
Model Table Name
User users
Category categories
Event events
Attendance Attendance (no @@map)

API Structure
All endpoints are under `/api/v1/` prefix (URI versioning).

Module Base Path Key Endpoints
Auth /api/v1/auth POST /login, POST /register, POST /refresh
User /api/v1/me GET /, PATCH /, etc.
Events /api/v1/event GET /, GET /:id, POST /, PATCH /:id, DELETE /:id
Categories /api/v1/category GET /, GET /:id, POST /, PATCH /:id, DELETE /:id
Attendance /api/v1/attendance GET /, POST /, DELETE /:id
Recommendations /api/v1/event-recommendation GET /:eventId

Standard API Response Format

```json
// Success response (wrapped by ResponseInterceptor)
{
  "statusCode": 200,
  "message": "Events retrieved successfully",
  "data": { /* entity or array */ }
}

// Paginated response
{
  "statusCode": 200,
  "message": "Events retrieved successfully",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "take": 20,
    "totalPages": 5
  }
}

// Error response (from ExceptionFilter)
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

Security Features
Authentication Flow
JWT-based stateless authentication
Access tokens + Refresh tokens (separate expiration)
Password hashing: bcrypt
Token validation via `AuthGuard`

Guard Usage in Controllers

```typescript
// Public endpoint — no guard (use @IsPublic() if needed)
@Post('login')
login() {}

// Authenticated users only
@UseGuards(AuthGuard)
@Get()
getEvents() {}

// Extract current user from request
@UseGuards(AuthGuard)
@Post()
createEvent(@UserDetails() user: UserEntity) {
  // user is extracted from JWT token
}
```

Security Checklist
JWT Authentication: Access + refresh tokens with configurable expiration
Input Validation: Joi schemas for all incoming data
Password Hashing: bcrypt for secure storage
SQL Injection Prevention: Prisma parameterized queries
CORS Configuration: Enabled via `app.enableCors()`
Swagger Access: Protected with basic auth (SWAGGER_USER / SWAGGER_PASSWORD)
Environment Validation: Joi schema validates all required env vars on startup
Configuration
Environment Variables

```bash
# SERVER
PORT=8080
BASE_URL=http://localhost:8080
NODE_ENV=development  # development | production | test

# SWAGGER
SWAGGER_USER=admin
SWAGGER_PASSWORD=secret

# DATABASE
DATABASE_URL=postgresql://user:password@localhost:5432/ems_db

# JWT
ACCESS_TOKEN_EXPIRE=3600        # seconds
REFRESH_TOKEN_EXPIRE=604800     # seconds (7 days)
JWT_SECRET_KEY=your-secret-key

# REDIS
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=300                   # default cache TTL in seconds
```

Configuration Files
prisma/schema.prisma — Database schema definition
src/schemas/env.schema.ts — Joi schema validating all env variables
src/configs/swagger.config.ts — Swagger/OpenAPI setup
tsconfig.json — TypeScript config with path aliases (`@/` → `src/`, `@generated/` → `generated/`)

Testing Strategy
Test Pyramid
Unit Tests: Services, repositories, guards, filters, pipes, interceptors (Jest + ts-jest)
Integration Tests: Module-level tests with real Prisma + Testcontainers (PostgreSQL)
E2E Tests: Full HTTP request tests via Supertest + Testcontainers
Performance Tests: Artillery and k6 load tests

Test Commands

```bash
npm test                    # Run unit tests
npm run test:watch          # Watch mode
npm run test:cov            # Coverage report
npm run test:e2e            # E2E tests (Testcontainers)
npm run test:integration    # Integration tests
npm run test:performance    # Load tests
```

Test File Naming
Type Pattern Location
Unit _.spec.ts src/modules/{feature}/
E2E _.e2e-spec.ts test/e2e/
Integration _.integration-spec.ts test/integration/
Performance _.ts test/performance/

Test Coverage
Target: 70%+ code coverage
Focus on business logic in services and repositories

⚡ Performance Optimization
Backend Performance

```typescript
// ✅ Parallel independent queries
const [events, totalCount] = await Promise.all([
  this.eventRepository.findPageableEvents(pageRequest),
  this.eventRepository.countEvents(pageRequest),
]);

// ✅ Select only needed fields
createdBy: {
  select: { id: true, firstName: true, lastName: true, email: true },
}

// ✅ Use Builder pattern for complex filters
const filter = new EventFilterBuilder()
  .addSearch(query.search)
  .addCategoryFilter(query.categoryId)
  .addDateRangeFilter(query.startDate, query.endDate)
  .addRadiusFilter(query.latitude, query.longitude, query.radiusKm)
  .build();

// ✅ Redis caching for expensive operations
const result = await this.cacheService.getOrSet(
  `events:${cacheKey}`,
  () => this.eventRepository.findExpensiveQuery(),
  300, // TTL in seconds
);

// ✅ Proper pagination
async findPageable(filter: FilterDto) {
  return this.repo.findMany({
    where,
    skip: filter.skip,
    take: filter.take,
    orderBy: { createdAt: 'desc' },
  });
}
```

Performance Checklist
Layer Check Target
Backend Simple endpoint < 100ms
Backend Complex endpoint (recommendations) < 500ms
Database Query with index < 10ms
Database Complex query (filtering + joins) < 100ms

Deployment
Docker

```bash
# Build Docker image
docker build -t ems-api:latest .

# Run
docker run -p 8080:8080 --env-file .env ems-api:latest
```

Production Start

```bash
npm run build              # Compile TypeScript
npm run start:prod         # node dist/main
```

Database Management

```bash
npm run db:migrate:dev      # Create + apply migration (dev)
npm run db:migrate:deploy   # Apply migrations (production)
npm run db:migrate:reset    # Reset database (destructive!)
npm run db:studio           # Open Prisma Studio GUI
npm run db:seed             # Run seed scripts
npm run client:generate     # Regenerate Prisma Client
```

🚨 Common Gotchas & Pitfalls
Things That Will Break If You Don't Know
Gotcha Why Solution
Using class-validator decorators Project uses Joi, not class-validator for validation Use Joi schemas + custom `ValidationPipe`
Forgetting `@ResponseMessage()` Interceptor sets `message` field in response Always add `@ResponseMessage('...')` to controller methods
Not using `checkExists()` utility Manual null checks are inconsistent Use `checkExists(promise, 'Not found message')` from `src/utils`
Querying Prisma directly in services Breaks the repository pattern Always go through Repository classes
Forgetting `@UseGuards(AuthGuard)` Route is unprotected Add `AuthGuard` to all protected endpoints
Missing password omit Password could leak in responses `DatabaseService` is configured with `omit: { user: { password: true } }` — use `findUserByEmailWithPassword` only for auth
Using `console.log` Not structured Use NestJS `Logger` service
Missing Joi schema for new endpoint Request won't be validated Create Joi schema in `schemas/` and use `new ValidationPipe(schema)`

Prisma Gotchas

```typescript
// ❌ WRONG: Exposing password in user queries
const user = await this.db.user.findUnique({ where: { id } });
// Password is omitted globally EXCEPT where explicitly selected

// ✅ RIGHT: Password only when needed (for auth)
const user = await this.db.user.findUnique({
  where: { email },
  omit: { password: false }, // Explicitly include password
});

// ❌ WRONG: N+1 queries
const events = await this.db.event.findMany();
for (const event of events) {
  event.category = await this.db.category.findUnique({ where: { id: event.categoryId } });
}

// ✅ RIGHT: Single query with include
const events = await this.db.event.findMany({
  include: { category: true, createdBy: true },
});

// ❌ WRONG: Not using indexes for filtered queries
// Prisma schema has @@index on createdById, categoryId, startDate
// If you add new filter fields, add indexes too

// ✅ RIGHT: Check schema for existing indexes, add new ones as needed
@@index([newFilterField])
```

Validation Gotchas

```typescript
// ❌ WRONG: Using NestJS built-in ValidationPipe
@UsePipes(new NestJSValidationPipe())

// ✅ RIGHT: Using custom Joi-based ValidationPipe
@UsePipes(new ValidationPipe(joiSchema))
// or per-param:
@Body(new ValidationPipe(createSchema)) dto: CreateDto

// ❌ WRONG: Creating Joi schema without .required() on needed fields
Joi.object({ name: Joi.string() }) // name is optional!

// ✅ RIGHT: Be explicit
Joi.object({ name: Joi.string().required() })
```

🎯 Quick Reference: File Locations
Backend Structure

```
src/modules/{feature}/
├── {feature}.module.ts          # NestJS module definition
├── {feature}.controller.ts      # REST endpoints (Swagger + Guards + ValidationPipe)
├── {feature}.service.ts         # Business logic
├── {feature}.repository.ts      # Prisma data access
├── {feature}.entity.ts          # TypeScript type definition
├── dtos/
│   ├── create-{feature}.dto.ts
│   └── update-{feature}.dto.ts
└── schemas/
    ├── create-{feature}.schema.ts  # Joi validation schema
    └── update-{feature}.schema.ts
```

Key Files Reference
Documentation
docs/ARCHITECTURE.md — Архітектура системи (цей файл)
docs/DATABASE.md — Схема БД, міграції, seed система, індекси, gotchas
docs/NEW-FEATURE-GUIDE.md — Покроковий гайд для створення нової feature з шаблонами коду

Entry Points & Configuration
src/main.ts — App bootstrap (CORS, global prefix `/api`, URI versioning, Swagger)
src/app.module.ts — Root module (all feature modules + global providers)
prisma/schema.prisma — Database schema
src/schemas/env.schema.ts — Environment validation

Core Modules
src/modules/event/ — Event management (main domain)
src/modules/event/recommendation/ — Recommendation engine
src/modules/auth/ — Authentication
src/modules/token/ — JWT token management
src/modules/user/ — User profiles
src/modules/category/ — Event categories
src/modules/attendance/ — Attendance tracking
src/modules/database/ — Prisma Client (DatabaseService)
src/modules/cache/ — Redis cache (CacheService)

Shared Infrastructure
src/guards/user.guard.ts — JWT AuthGuard
src/filters/ — Exception filters chain
src/interceptors/response.interceptor.ts — Response wrapper
src/pipes/validation.pipe.ts — Joi-based validation
src/decorators/ — Custom decorators (@ResponseMessage, @UserDetails, @IsPublic)
src/utils/ — Shared utilities (checkExists, PageRequest, PageResponse, SuccessResponse, ErrorResponse)

Version: 1.0.0
Last Updated: February 2025
Status: Active Development
