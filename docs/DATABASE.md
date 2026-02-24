# EMS Backend — Database Guide

## Огляд

- **ORM:** Prisma 7.0.1 з `@prisma/adapter-pg` (PostgreSQL native adapter)
- **БД:** PostgreSQL
- **Schema:** `prisma/schema.prisma`
- **Generated Client:** `generated/prisma/`
- **DatabaseService:** `src/modules/database/database.service.ts` — extends `PrismaClient`, глобальний модуль

---

## Схема бази даних

### Entity Relationship Diagram

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

### Моделі

#### User (`users`)

| Поле      | Тип      | Опис                                          |
| --------- | -------- | --------------------------------------------- |
| id        | UUID     | PK, auto-generated                            |
| firstName | String   | Ім'я                                          |
| lastName  | String   | Прізвище                                      |
| email     | String   | Унікальний email                              |
| password  | String?  | Хеш пароля (bcrypt), omitted за замовчуванням |
| createdAt | DateTime | Дата створення                                |
| updatedAt | DateTime | Авто-оновлення                                |

**Відношення:** → Event (1:N), → Category (1:N), → Attendance (1:N)

#### Category (`categories`)

| Поле        | Тип      | Опис            |
| ----------- | -------- | --------------- |
| id          | UUID     | PK              |
| name        | String   | Назва категорії |
| description | String?  | Опис            |
| createdById | String   | FK → User       |
| createdAt   | DateTime | Дата створення  |
| updatedAt   | DateTime | Авто-оновлення  |

**Індекси:** `@@index([createdById])`

#### Event (`events`)

| Поле        | Тип      | Опис                      |
| ----------- | -------- | ------------------------- |
| id          | UUID     | PK                        |
| title       | String   | Назва події               |
| description | String   | Опис                      |
| startDate   | DateTime | Дата початку              |
| endDate     | DateTime | Дата кінця                |
| location    | String   | Місце проведення          |
| latitude    | Float?   | Широта (для geo-фільтра)  |
| longitude   | Float?   | Довгота (для geo-фільтра) |
| createdById | String   | FK → User                 |
| categoryId  | String?  | FK → Category (optional)  |
| createdAt   | DateTime | Дата створення            |
| updatedAt   | DateTime | Авто-оновлення            |

**Індекси:** `@@index([createdById])`, `@@index([categoryId])`, `@@index([startDate])`

#### Attendance (без `@@map`)

| Поле      | Тип      | Опис           |
| --------- | -------- | -------------- |
| id        | UUID     | PK             |
| userId    | String   | FK → User      |
| eventId   | String   | FK → Event     |
| createdAt | DateTime | Дата створення |
| updatedAt | DateTime | Авто-оновлення |

**Cascade:** Видалення User або Event видаляє пов'язані Attendance записи.

---

## Відношення

| Батько   | Дитина     | Тип | FK поле              | Ondelete |
| -------- | ---------- | --- | -------------------- | -------- |
| User     | Event      | 1:N | event.createdById    | Cascade  |
| User     | Category   | 1:N | category.createdById | Cascade  |
| User     | Attendance | 1:N | attendance.userId    | Cascade  |
| Event    | Attendance | 1:N | attendance.eventId   | Cascade  |
| Category | Event      | 1:N | event.categoryId     | Restrict |

---

## DatabaseService

`DatabaseService` extends `PrismaClient` і є **глобальним** модулем:

```typescript
@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });
    super({
      adapter,
      omit: {
        user: { password: true }, // ⚠️ password прихований за замовчуванням
      },
    });
  }
}
```

> **⚠️ ВАЖЛИВО:** Пароль користувача **omitted** глобально. Щоб отримати пароль (тільки для auth):
>
> ```typescript
> await this.db.user.findUnique({
>   where: { email },
>   omit: { password: false },
> });
> ```

---

## Команди

```bash
# Міграції
npm run db:migrate:dev           # Створити + застосувати міграцію (dev)
npm run db:migrate:deploy        # Застосувати міграції (production)
npm run db:migrate:reset         # Скинути БД повністю (⚠️ видаляє всі дані!)

# Prisma Client
npm run client:generate          # Перегенерувати клієнт після зміни schema

# Seed
npm run db:seed                  # Запустити всі seeders

# Інше
npm run db:studio                # Відкрити Prisma Studio (GUI)
```

---

## Міграції

Міграції зберігаються в `prisma/migrations/`:

| Міграція                      | Опис                                                |
| ----------------------------- | --------------------------------------------------- |
| `20251130220237_init`         | Початкова схема (User, Category, Event, Attendance) |
| `20251201202608_add_location` | Додано latitude/longitude на Event                  |

### Створення нової міграції

```bash
# 1. Змінити prisma/schema.prisma
# 2. Створити міграцію
npx prisma migrate dev --name descriptive-name

# 3. Перегенерувати клієнт
npm run client:generate
```

---

## Seed система

### Архітектура

Seeders використовують **абстрактний клас** `Seeder`:

```typescript
export abstract class Seeder {
  abstract seed(prisma: PrismaClient): Promise<void>;
  abstract shouldRun(prisma: PrismaClient): Promise<boolean>;

  async run(prisma: PrismaClient): Promise<void> {
    if (!(await this.shouldRun(prisma))) return; // Пропускає якщо дані вже є
    await this.seed(prisma);
  }
}
```

**Ключова особливість:** `shouldRun()` перевіряє чи дані вже існують (ідемпотентність).

### Seeders (порядок виконання)

| #   | Seeder             | Кількість        | Залежить від   |
| --- | ------------------ | ---------------- | -------------- |
| 1   | `UserSeeder`       | ~10 користувачів | —              |
| 2   | `CategorySeeder`   | ~10 категорій    | User           |
| 3   | `EventSeeder`      | 100 подій        | User, Category |
| 4   | `AttendanceSeeder` | ~N записів       | User, Event    |

### Створення нового seeder

```typescript
// prisma/seeds/feature.seeder.ts
import { PrismaClient } from '../../generated/prisma/client';
import { Seeder } from './seeder.abstract';

export class FeatureSeeder extends Seeder {
  async shouldRun(prisma: PrismaClient): Promise<boolean> {
    const count = await prisma.feature.count();
    return count === 0;
  }

  async seed(prisma: PrismaClient): Promise<void> {
    await prisma.feature.createMany({
      data: [
        // seed data
      ],
    });
  }
}
```

Потім додати в `prisma/seed.ts`:

```typescript
const seeders = [
  // ... existing
  new FeatureSeeder(), // ← додати в правильному порядку (після залежностей)
];
```

---

## Індекси та оптимізація

### Існуючі індекси

```prisma
// Category
@@index([createdById])

// Event
@@index([createdById])
@@index([categoryId])
@@index([startDate])
```

### Коли додавати новий індекс

Додавайте `@@index` якщо поле:

- Використовується в `where` фільтрах
- Використовується в `orderBy`
- Є FK (foreign key) — Prisma не створює індекси автоматично

```prisma
// Приклад: додати індекс на нове поле
model Feature {
  status String

  @@index([status])       // фільтрація по статусу
  @@index([createdById])  // FK індекс
}
```

---

## ⚠️ Gotchas

| Проблема                      | Рішення                                                                |
| ----------------------------- | ---------------------------------------------------------------------- |
| Password витікає в response   | `DatabaseService` має `omit: { user: { password: true } }` — не змінюй |
| N+1 запити                    | Використовуй `include` замість окремих запитів в циклі                 |
| Відсутній індекс на FK        | Завжди додавай `@@index` на FK поля                                    |
| `migrate reset` на production | **НІКОЛИ** — видаляє всі дані! Тільки `migrate deploy`                 |
| Seed запускається двічі       | `shouldRun()` перевіряє `count === 0`, safe to re-run                  |
| Забув `client:generate`       | Prisma Client не оновиться — завжди запускай після зміни schema        |
| `@@map` відсутній             | Attendance модель не має `@@map`, таблиця = `Attendance` (PascalCase)  |
