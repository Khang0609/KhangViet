# Khang Viet Design - API Endpoints Map

All routes live under `apps/api/src/routes/`.

## Public Content (`/api/v1/content` — `publicContent.ts`)

| Method | Endpoint        | Summary                                       | Response                                                 |
| :----- | :-------------- | :-------------------------------------------- | :------------------------------------------------------- |
| `GET`  | `/landing`      | Full landing page data                        | `{ success: true, data: LandingContent }`                |
| `GET`  | `/projects`     | Featured projects list                        | `{ success: true, data: FeaturedProject[] }`             |
| `GET`  | `/projects/:id` | Project detail by ID                          | `{ success: true, data: FeaturedProject }` (or `404`)    |

## Public Leads (`/api/v1/leads` — `publicLeads.ts`)

| Method | Endpoint | Summary                          | Request Body                                                                                          | Response                                              |
| :----- | :------- | :------------------------------- | :---------------------------------------------------------------------------------------------------- | :---------------------------------------------------- |
| `POST` | `/`      | Submit contact / consultation    | `CreateLeadDto` (`fullName`, `phone`, `email?`, `serviceCategory?`, `projectScale?`, `message?`)      | `201 Created`: `{ success: true, data: ContactLead }` |

## Authentication (`/api/auth` — `auth.ts`, `/api` — `protected.ts`)

| Method | Endpoint     | Summary                                   | Notes                                                        |
| :----- | :----------- | :---------------------------------------- | :----------------------------------------------------------- |
| `POST` | `/login`     | Login with `{ email, password }`          | Sets `refreshToken` HttpOnly cookie; returns `accessToken`   |
| `POST` | `/refresh`   | Rotate `refreshToken` cookie              | Returns new `accessToken` and rotates `refreshToken` cookie  |
| `GET`  | `/protected` | Verify Bearer token & return current user | Requires `authMiddleware` (`Authorization: Bearer <token>`)  |

## Admin CMS (`/api/v1/admin/cms` — `adminCms.ts`, requires `adminAuthMiddleware`)

| Method   | Endpoint               | Summary                                          |
| :------- | :--------------------- | :----------------------------------------------- |
| `GET`    | `/sync-status`         | Sync status & pending changes count              |
| `GET`    | `/pending-changes`     | List pending CMS changes                         |
| `POST`   | `/apply-changes`       | Publish pending changes & trigger web revalidate |
| `DELETE` | `/pending-changes/:id` | Discard a pending CMS change                     |
| `POST`   | `/projects`            | Create project (`CreateProjectDto`)              |
| `PUT`    | `/projects/:id`        | Update project (`UpdateProjectDto`)              |
| `DELETE` | `/projects/:id`        | Delete project                                   |
| `PUT`    | `/hero`                | Update hero slides (`{ slides: HeroSlide[] }`)   |
| `PUT`    | `/legal`               | Update legal info (`LegalInfo`)                  |

## Admin Leads (`/api/v1/admin/leads` — `adminLeads.ts`, requires `adminAuthMiddleware`)

| Method   | Endpoint      | Summary                                                                               |
| :------- | :------------ | :------------------------------------------------------------------------------------ |
| `GET`    | `/`           | List leads (query: `status?`, `search?`)                                              |
| `GET`    | `/:id`        | Get lead detail by ID                                                                 |
| `PATCH`  | `/:id/status` | Update lead status (`NEW`, `CONTACTED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`)      |
| `DELETE` | `/:id`        | Delete lead by ID                                                                     |
