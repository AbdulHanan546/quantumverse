# Student Progress Tracking — Implementation Plan

This document outlines how to add student progress tracking across the Quantumverse app (client + NestJS server + Strapi CMS content).

## Goals
- Persist a student’s progress per topic (and optionally per chapter).
- Track position within a topic (current block index), percentage, and completion state.
- Expose secure APIs for reading/updating progress.
- Show progress UI on topic lists and within the topic player.

## Chapter Progress (New)
- Maintain a student’s progress per chapter in addition to per-topic.
- Aggregate topic-level progress into chapter-level metrics (e.g., completed topics count, average percent, last activity).
- Provide simple and efficient reads for chapter dashboards/cards.

## High-Level Architecture
- Identity/auth remains in the NestJS server (`server/`) via JWT.
- Content remains in Strapi CMS (external). We reference items by Strapi `documentId`.
- New `Progress` entity/table in the NestJS server stores user-scoped progress.
- Client (`client/`) calls server `/progress/*` endpoints to read/update.

```
[Client (React)]  →  [NestJS Server /progress]  →  [Postgres via TypeORM]
         ↑                   |
   TopicRenderer             | JWT
         |                   ↓
    onNext()        ProgressService (findOrCreate/update/complete)
```

## Data Model (TypeORM)
Minimal, practical schema keyed by user + topic `documentId`:

```ts
// server/src/progress/progress.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

@Entity('progress')
@Unique(['user', 'topicDocumentId'])
export class Progress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'varchar', length: 128 })
  topicDocumentId: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  chapterDocumentId: string | null;

  @Column({ type: 'int', default: 0 })
  lastIndex: number; // 0-based index of last viewed block

  @Column({ type: 'int', default: 0 })
  totalBlocks: number; // snapshot from client at time of update

  @Column({ type: 'int', default: 0 })
  percent: number; // 0..100 derived on save

  @Column({ type: 'varchar', length: 32, default: 'not_started' })
  status: ProgressStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date | null;
}
```

Notes:
- `topicDocumentId` and optional `chapterDocumentId` come from Strapi.
- `percent` is derived from `lastIndex/totalBlocks` and clamped 0–100.

### ChapterProgress entity (option A: materialized/denormalized)
For fast reads on chapter cards, create a separate `ChapterProgress` table that is updated whenever any child topic progress changes.

```ts
// server/src/progress/chapter-progress.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('chapter_progress')
@Unique(['user', 'chapterDocumentId'])
export class ChapterProgress {
  @PrimaryGeneratedColumn() id: number;
  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' }) user: User;
  @Column({ type: 'varchar', length: 128 }) chapterDocumentId: string;

  // Aggregates
  @Column({ type: 'int', default: 0 }) totalTopics: number;
  @Column({ type: 'int', default: 0 }) completedTopics: number;
  @Column({ type: 'int', default: 0 }) averagePercent: number; // 0..100

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
```

Update strategy:
- When a topic progress is started/updated/completed and has a `chapterDocumentId`, recompute aggregates for that chapter:
  - `totalTopics`: count of topics in that chapter for which the user has any progress entry (or from CMS list if you prefer including untouched topics).
  - `completedTopics`: count of `status=completed`.
  - `averagePercent`: mean of `percent` across topics in that chapter.

Option B (on-the-fly aggregation):
- Skip a separate table and compute aggregates by querying `Progress` rows for the chapter each time. Simpler write path; read may be slower without caching. You can combine with an in-memory cache or Redis later if needed.

## API Design (NestJS)
All routes require `JwtAuthGuard` (student or admin).

- `GET /api/progress/me`
  - Returns array of the calling user’s progress rows.
- `GET /api/progress/topic/:topicDocumentId`
  - Returns a single progress row for this topic (or 404/empty if none).
- `POST /api/progress/start`
  - Body: `{ topicDocumentId, chapterDocumentId?, totalBlocks }`
  - Idempotent: creates if missing; sets status to `in_progress`.
- `PATCH /api/progress/topic/:topicDocumentId`
  - Body: `{ lastIndex, totalBlocks? }`
  - Updates index, recomputes percent, sets status to `in_progress` or `completed` if at end.
- `POST /api/progress/complete`
  - Body: `{ topicDocumentId }`
  - Forces status to `completed`, sets `percent=100`, `completedAt=now()`.

### Chapter Progress endpoints
- `GET /api/progress/chapter/:chapterDocumentId`
  - Returns aggregates for this chapter for the current user.
- `GET /api/progress/chapters`
  - Returns aggregates across all chapters the user has interacted with.

Example responses (trimmed):
```json
{
  "id": 12,
  "topicDocumentId": "tp_abc123",
  "chapterDocumentId": "ch_def456",
  "lastIndex": 7,
  "totalBlocks": 20,
  "percent": 40,
  "status": "in_progress",
  "updatedAt": "2025-12-06T12:34:56.000Z"
}
```

## Server Implementation Steps
1) Generate module, service, controller

```cmd
cd server
npx nest g module progress
npx nest g service progress --no-spec
npx nest g controller progress --no-spec
```

2) Create the entity `server/src/progress/progress.entity.ts` (see snippet above) and export it from the progress module via `TypeOrmModule.forFeature([Progress])`.

3) Implement `ProgressService` with helpers:
- `getAllForUser(userId)`
- `getForUserAndTopic(userId, topicDocumentId)`
- `start(userId, dto)` — idempotent upsert to in_progress
- `update(userId, topicDocumentId, patch)` — recompute `percent` and `status`
- `complete(userId, topicDocumentId)`

4) Implement `ProgressController` routes, use `@UseGuards(JwtAuthGuard)` and read `req.user.sub`.

5) Register module
- Add `ProgressModule` to `server/src/app.module.ts` imports.

6) Database
- Dev: keep `DB_SYNC=true` to have TypeORM sync the table.
- Prod: create a proper migration (optional initial approach):

```ts
// example migration outline
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProgress1733490000000 implements MigrationInterface {
  name = 'CreateProgress1733490000000';
  async up(qr: QueryRunner) {
    await qr.query(`CREATE TABLE IF NOT EXISTS progress (...);`);
  }
  async down(qr: QueryRunner) {
    await qr.query(`DROP TABLE IF EXISTS progress;`);
  }
}
```

7) Run server

```cmd
cd server
set DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DB
set JWT_SECRET=your_secret
set DB_SYNC=true
npm run dev
```

## Client Implementation Steps
1) Add API wrapper `client/src/api/progress.ts`

```ts
import { api } from './client';

export interface ProgressRow {
  id: number;
  topicDocumentId: string;
  chapterDocumentId?: string | null;
  lastIndex: number;
  totalBlocks: number;
  percent: number;
  status: 'not_started' | 'in_progress' | 'completed';
  updatedAt: string;
}

export async function getMyProgress(): Promise<ProgressRow[]> {
  const { data } = await api.get<ProgressRow[]>('/progress/me');
  return data;
}

export async function getTopicProgress(topicDocumentId: string): Promise<ProgressRow | null> {
  try {
    const { data } = await api.get<ProgressRow>(`/progress/topic/${topicDocumentId}`);
    return data;
  } catch {
    return null;
  }
}

export async function startTopic(payload: { topicDocumentId: string; chapterDocumentId?: string; totalBlocks: number; }): Promise<ProgressRow> {
  const { data } = await api.post<ProgressRow>('/progress/start', payload);
  return data;
}

export async function updateTopicProgress(topicDocumentId: string, patch: { lastIndex: number; totalBlocks?: number; }): Promise<ProgressRow> {
  const { data } = await api.patch<ProgressRow>(`/progress/topic/${topicDocumentId}`, patch);
  return data;
}

export async function completeTopic(topicDocumentId: string): Promise<ProgressRow> {
  const { data } = await api.post<ProgressRow>('/progress/complete', { topicDocumentId });
  return data;
}
```

2) Add Progress context `client/src/context/ProgressContext.tsx`
- Cache user progress in memory.
- Expose helpers: `getForTopic`, `start`, `update`, `complete`, `refresh`.
- Load on boot when authenticated. Consider lightweight throttling for updates.

3) Wire the provider
- Wrap routes inside `<ProgressProvider>` (near `AuthProvider` in `App.tsx`).

4) TopicRenderer integration
- Read `topicDocumentId` from `useParams()` (route `/topic/:slug`).
- On mount: call `startTopic({ topicDocumentId, totalBlocks: components.length })` (idempotent).
- On every `next()` call: `updateTopicProgress(topicDocumentId, { lastIndex: index + 1, totalBlocks: components.length })`.
- When reaching the end: call `completeTopic(topicDocumentId)`.

5) Topic/Chapter screens
- In `ChapterTopic` cards, show a small progress pill for each topic (percent or checkmark if completed). Fetch via context or `getMyProgress()` once.
- In `StudentHome`, consider a chapter-level aggregate (avg of child topics or completed count).

6) Chapter progress UI
- Add `client/src/api/chapterProgress.ts` for chapter aggregates endpoints.
- Show per-chapter progress on `StudentHome` cards: e.g., `3/7 topics completed`, `avg 56%`.
- Optionally display a small progress bar for visual clarity.

### Example: minimal TopicRenderer changes
```tsx
// inside TopicRenderer
import { useParams } from 'react-router-dom';
import { startTopic, updateTopicProgress, completeTopic } from '../api/progress';

const { slug: topicDocumentId } = useParams();
useEffect(() => {
  if (!topicDocumentId) return;
  startTopic({ topicDocumentId, totalBlocks: components.length }).catch(() => {});
}, [topicDocumentId, components.length]);

const next = useCallback(() => {
  // existing debounce logic ...
  if (index < components.length - 1) {
    updateTopicProgress(topicDocumentId!, { lastIndex: index + 1, totalBlocks: components.length }).catch(() => {});
    setIndex((prev) => prev + 1);
  } else {
    completeTopic(topicDocumentId!).catch(() => {});
  }
}, [index, components.length, topicDocumentId]);
```

## Strapi/CMS Considerations
- Rely on `documentId` for stable identification. Ensure topics and chapters expose it in API responses (already used in client).
- No CMS changes are required for basic progress — we only store references.

## Edge Cases & Polishing
- Debounce/throttle updates to avoid noisy writes (e.g., only send when index changes and at most once per 300–500ms).
- Offline handling: enqueue updates to localStorage and flush on reconnect.
- Resetting progress: add `DELETE /progress/topic/:topicDocumentId` (optional admin/self-service).
- Privacy: users can only read their own progress; admins can read anyone’s (optional extension).

## Acceptance Criteria
- Progress state persists across sessions for a signed-in student.
- Topic cards show percent or completed state reliably.
- Completing a topic sets `status=completed`, `percent=100`, and a timestamp.
- APIs are authenticated and reject cross-user access.

## Quick Test Commands
Assuming server runs on `http://localhost:3000/api` and you have a valid JWT in `%TOKEN%`:

```cmd
:: List my progress
curl -H "Authorization: Bearer %TOKEN%" http://localhost:3000/api/progress/me

:: Start a topic
curl -X POST -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" ^
  -d "{\"topicDocumentId\":\"tp_abc123\",\"totalBlocks\":20}" ^
  http://localhost:3000/api/progress/start

:: Update position
curl -X PATCH -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" ^
  -d "{\"lastIndex\":5,\"totalBlocks\":20}" ^
  http://localhost:3000/api/progress/topic/tp_abc123

:: Complete
curl -X POST -H "Authorization: Bearer %TOKEN%" -H "Content-Type: application/json" ^
  -d "{\"topicDocumentId\":\"tp_abc123\"}" ^
  http://localhost:3000/api/progress/complete
```

## Rollout Plan
1) Ship server `ProgressModule` with `DB_SYNC=true` in staging.
2) Integrate client API + context + UI badges hidden behind a feature flag if needed.
3) Validate write volume and adjust throttling.
4) Add migrations and disable sync for production.

5) Chapter Progress rollout
- Start with on-the-fly aggregation (Option B) for speed of delivery.
- If reads become hot or slow, introduce `ChapterProgress` table and update within `ProgressService.update/complete`.

---
If you’d like, I can scaffold the server ProgressModule and client API/context now and open a small PR to get you moving quickly.
