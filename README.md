EMS Backend — Token-Efficient Navigation
Total Documentation Size: ~1,500 lines (ARCHITECTURE.md + DATABASE.md + NEW-FEATURE-GUIDE.md)
Strategy: Load only what you need

🎯 Quick Decision Tree (Read This First)
What are you working on?
│
├─ General question / Starting new task?
│ └─ Read: ARCHITECTURE.md (Section: 🤖 LLM Quick Reference)
│
├─ Adding a new module/feature?
│ └─ Read: NEW-FEATURE-GUIDE.md (full step-by-step with code templates)
│
├─ Working with Events / Recommendations?
│ └─ Read: ARCHITECTURE.md (Sections: Event Module, Strategy Pattern)
│
├─ Authentication / Security?
│ └─ Read: ARCHITECTURE.md (Sections: Security Features, Auth Flow)
│
├─ Database schema / Prisma?
│ └─ Read: DATABASE.md (full database guide with schema, migrations, seeds)
│
└─ Understanding the whole system?
└─ Read: ARCHITECTURE.md (Section: LLM Quick Reference only)
📊 File Priority & Token Cost
File Lines Priority When to Load
This File (README.md) ~150 🔴 ALWAYS Start here, decide what else to load
NEW-FEATURE-GUIDE.md ~300 🟠 HIGH Adding a new feature module
DATABASE.md ~250 🟠 HIGH Database schema, migrations, seeds
ARCHITECTURE.md ~800 🟡 MEDIUM First time / unfamiliar with codebase
Token-Saving Tip: Load only the "MUST READ" sections from ARCHITECTURE.md (marked with 🔴), skip "REFERENCE" sections.

⚡ Essential Rules (Load These First - ~500 tokens)
Performance (Non-Negotiable)

```typescript
// Parallel queries — always for independent data
const [events, totalCount] = await Promise.all([
  this.eventRepository.findPageableEvents(filter),
  this.eventRepository.countEvents(filter),
]);

// Always paginate — use PageRequest/PageResponse
{ skip: filter.skip, take: filter.take }

// Redis caching for expensive operations
const result = await this.cacheService.getOrSet(key, () => fetchData(), 300);
```

Critical Patterns

```typescript
// Joi validation — NOT class-validator
@UsePipes(new ValidationPipe(joiSchema))
async create(@Body() dto: CreateDto) {}
// or per-param:
@Body(new ValidationPipe(createSchema)) dto: CreateDto

// Response message — always add to controller methods
@ResponseMessage('Items retrieved successfully')

// Find or throw pattern
return checkExists(this.repo.findById(id), 'Not found');

// Repository pattern — never query Prisma directly in services
constructor(private readonly featureRepository: FeatureRepository) {}
```

File Locations
Need Path
New feature (full guide) docs/NEW-FEATURE-GUIDE.md
Database guide (full) docs/DATABASE.md
Backend endpoint src/modules/{feature}/
Database schema prisma/schema.prisma
Validation schema src/modules/{feature}/schemas/
Shared utility src/utils/
Guard src/guards/
Filter src/filters/
Interceptor src/interceptors/
Decorator src/decorators/
Pipe src/pipes/
Environment config src/schemas/env.schema.ts

📖 ARCHITECTURE.md — Section Loading Guide

```
MUST READ (load first ~200 lines):
├─ 🤖 LLM Quick Reference — Domain terms, file locations, critical rules
├─ Common Implementation Patterns — Service, Controller, Repository examples
└─ Common Gotchas — Joi vs class-validator, password omit, N+1

REFERENCE (load only if needed):
├─ Database Schema (ERD, indexes, relationships)
├─ API Structure (endpoints, response format)
├─ Security Features (guards, JWT flow)
├─ Testing Strategy (commands, file naming)
└─ Performance Optimization (caching, parallel queries)
```

🎛️ Loading Strategy by Task Type
Task: Add New Backend Module

```
Load Order:
1. This file (README.md) — 2 min read
2. docs/NEW-FEATURE-GUIDE.md — ~300 lines (full step-by-step with code templates)
3. ARCHITECTURE.md (Database Schema) — if needed, ~100 lines

Skip: ARCHITECTURE.md Common Tasks section (covered by NEW-FEATURE-GUIDE.md)
Total: ~300 lines with full code templates
```

Task: Fix Authentication Issues

```
Load Order:
1. This file (README.md)
2. ARCHITECTURE.md (Security Features + Auth Flow) — ~100 lines
3. ARCHITECTURE.md (LLM Quick Reference) — ~80 lines

Skip: Database schema, Performance, Testing sections
Total: ~180 lines (80% reduction)
```

Task: Optimize Slow Query

```
Load Order:
1. This file (README.md)
2. ARCHITECTURE.md (Performance Optimization) — ~80 lines
3. ARCHITECTURE.md (Database Schema — Indexes) — ~50 lines

Skip: Auth, Testing, Module structure sections
Total: ~130 lines (85% reduction)
```

Task: Database / Prisma Work

```
Load Order:
1. This file (README.md)
2. docs/DATABASE.md — ~250 lines (schema, migrations, seeds, indexes, gotchas)

Skip: ARCHITECTURE.md database section (covered by DATABASE.md)
Total: ~250 lines with full details
```

Task: First Time in Codebase

```
Load Order:
1. This file (README.md)
2. ARCHITECTURE.md (🤖 LLM Quick Reference only) — ~80 lines
3. ARCHITECTURE.md (Project Structure) — ~60 lines

Then load domain-specific sections as needed
Total: ~140 lines for orientation (84% reduction)
```

🚀 Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET_KEY, etc.

# 3. Generate Prisma Client
npm run client:generate

# 4. Run migrations
npm run db:migrate:dev

# 5. Seed database (optional)
npm run db:seed

# 6. Start development server
npm run start:dev
```

🚀 Quick Command Reference

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugger
npm run build              # Build for production
npm run start:prod         # Run production build

# Database
npm run client:generate    # Regenerate Prisma Client
npm run db:migrate:dev     # Create + apply migration
npm run db:migrate:deploy  # Apply migrations (production)
npm run db:migrate:reset   # Reset database (destructive!)
npm run db:studio          # Open Prisma Studio GUI
npm run db:seed            # Run seed scripts

# Testing
npm test                   # Run unit tests
npm run test:watch         # Watch mode
npm run test:cov           # Coverage report
npm run test:e2e           # E2E tests (Testcontainers)
npm run test:integration   # Integration tests
npm run test:performance   # Load tests (Artillery/k6)

# Code Quality
npm run lint               # ESLint fix
npm run format             # Prettier format

# Docker
docker build -t ems-api:latest .
docker run -p 3000:3000 --env-file .env ems-api:latest
```

🔍 How to Use This System
For LLMs:

- Always read this file first (~150 lines)
- Use the decision tree to determine which ARCHITECTURE.md sections to load
- Load only MUST READ sections from ARCHITECTURE.md
- Skip REFERENCE sections unless you need specific examples
- Use Grep/Search to find specific patterns instead of loading entire files

For Humans:

- This structure helps AI assistants load only relevant documentation
- Reduces context window usage by 70-85%
- Faster responses, lower costs
- Full architecture details available in `docs/ARCHITECTURE.md`

💡 Token-Saving Tips

- **Don't load all docs at once** — Use this index to decide
- **Load sections, not files** — Use the line ranges provided in ARCHITECTURE.md's table of contents
- **Search before loading** — Use grep to find specific patterns
- **Cache essential patterns** — The "Essential Rules" section above covers 80% of needs
- **Load examples on-demand** — Only when implementing similar functionality

Last Updated: February 2025
Token Cost of This File: ~150 lines (~600 tokens)
Token Savings: 70-85% vs loading full ARCHITECTURE.md
