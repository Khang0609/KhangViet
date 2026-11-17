# Graph Report - source  (2026-11-17)

## Corpus Check
- 238 files · ~383,657 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 17 file(s) not represented in the graph (top: .ttf 7, (none) 4, .jsonc 2)

## Summary
- 1950 nodes · 4443 edges · 90 communities (83 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 104 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8bc9ed97`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- lib
- photos.mjs
- consistency.mjs
- services/authService.ts
- services/types.ts
- icons.mjs
- start.mjs
- copy-lint.mjs
- gate.mjs
- factory.ts
- project.ts
- UniversalMediaUpload.tsx
- moments.mjs
- generateSampleImage
- effects.mjs
- d1-cms-repository.ts
- LandingContext.tsx
- SafeUser
- api/src/index.ts
- perf.mjs
- lucide-react
- GalleryFilterBar.tsx
- web/package.json
- shoot.mjs
- galleryClusters.ts
- app/page.tsx
- user.ts
- norm
- runWidth
- sleep
- ref_node_fs
- D1CmsRepository
- adminLeads.ts
- react
- compilerOptions
- sync.ts
- auth/authService.ts
- repositories/package.json
- JsonCmsRepository.ts
- adminCms.ts
- getRepositories
- types/src/index.ts
- seed-local-d1.mjs
- ISessionRepository
- cms.ts
- tasks
- data/package.json
- api/package.json
- assets_classify.py
- block
- publicLeads.ts
- ImageCard.tsx
- seed.ts
- FeaturedProject
- die
- test-challenger-deep-stress.mjs
- publicContent.ts
- compilerOptions
- compilerOptions
- test-media-upload.mjs
- package.json
- data/src/index.ts
- compilerOptions
- refsOf
- ref_node_assert
- BentoClusterSection.tsx
- compilerOptions
- compilerOptions
- PasswordService
- auth.ts
- D1Client
- dependencies
- tilesMod
- analyse
- ref_node_path
- Button.tsx
- dotOf
- applyFlags
- browserChecks
- staticChecks
- opt
- allowBuilds
- scripts
- @hono/zod-openapi
- shaderLint
- pnpm
- postcss.config.mjs
- eslint.config.mjs
- AppError
- layout.tsx

## God Nodes (most connected - your core abstractions)
1. `lib()` - 148 edges
2. `react` - 61 edges
3. `sel()` - 48 edges
4. `shown()` - 45 edges
5. `inFixed()` - 42 edges
6. `FeaturedProject` - 36 edges
7. `rgba()` - 34 edges
8. `lucide-react` - 33 edges
9. `ownText()` - 30 edges
10. `measure()` - 30 edges

## Surprising Connections (you probably didn't know these)
- `BentoTile` --references--> `GalleryProject`  [EXTRACTED]
  apps/web/components/gallery/BentoClusterSection.tsx → packages/types/src/gallery.ts
- `GalleryHeroStatsProps` --references--> `GalleryStats`  [EXTRACTED]
  apps/web/components/gallery/GalleryHeroStats.tsx → packages/types/src/gallery.ts
- `AuthSession` --references--> `SafeUser`  [EXTRACTED]
  apps/api/src/services/authService.ts → packages/types/src/user.ts
- `LandingContextValue` --references--> `CompanyLegalInfo`  [EXTRACTED]
  apps/web/components/contexts/LandingContext.tsx → packages/types/src/cms.ts
- `LandingContextValue` --references--> `CoreDiscipline`  [EXTRACTED]
  apps/web/components/contexts/LandingContext.tsx → packages/types/src/cms.ts

## Import Cycles
- 2-file cycle: `apps/web/components/modules/header/HeaderMobileNav.tsx -> apps/web/components/shared/SiteHeader.tsx -> apps/web/components/modules/header/HeaderMobileNav.tsx`
- 2-file cycle: `apps/api/src/helpers/repoResolver.ts -> apps/api/src/middlewares/authMiddleware.ts -> apps/api/src/helpers/repoResolver.ts`

## Communities (90 total, 7 thin omitted)

### Community 0 - "lib"
Cohesion: 0.06
Nodes (135): lib(), add(), arrive(), audit(), backdrop(), barRoot(), beneath(), bordered() (+127 more)

### Community 1 - "photos.mjs"
Cohesion: 0.06
Nodes (69): ALIAS, argv, byId, cmdPath(), craftFits(), craftOf(), CRAFTS, credit() (+61 more)

### Community 2 - "consistency.mjs"
Cohesion: 0.03
Nodes (58): argv, asJson, AUDIENCE, BANNED, BUSY_EDGE, BUSY_RNG, CATEGORY, CHECKS (+50 more)

### Community 3 - "services/authService.ts"
Cohesion: 0.28
Nodes (9): AuthService, JWT_ALGORITHM, TokenService, err(), ok(), Result, AccessTokenPayload, LoginCredentials (+1 more)

### Community 4 - "services/types.ts"
Cohesion: 0.05
Nodes (50): dependencies, @cf-wasm/photon@^0.4.0, hono@^4.13.2, @khangviet/types@workspace:*, devDependencies, @cloudflare/workers-types@^4.20241022.0, @types/node@^20.19.43, wrangler@^4.154.0 (+42 more)

### Community 5 - "icons.mjs"
Cohesion: 0.08
Nodes (54): ALIAS, argv, CACHE, checkCmd(), clean(), colours(), contentBox(), fetchCached() (+46 more)

### Community 6 - "start.mjs"
Cohesion: 0.05
Nodes (45): ALIAS, allTypes, args, axisOrder(), axisVal(), block(), buttonInk(), dealTypes() (+37 more)

### Community 7 - "copy-lint.mjs"
Cohesion: 0.07
Nodes (47): APART, args, attrOf(), BLOCK, brandsOf(), CAST, CAST_CO, clip() (+39 more)

### Community 8 - "gate.mjs"
Cohesion: 0.05
Nodes (37): args, base, children, dot, FAMILY, files, fp, gateDir (+29 more)

### Community 9 - "factory.ts"
Cohesion: 0.09
Nodes (23): RFC-4122, RFC-9562, createD1Client(), D1DatabaseBinding, D1LeadRepository, findOrCreateIdentity(), LeadJoinedRow, mapToContactLead() (+15 more)

### Community 10 - "project.ts"
Cohesion: 0.07
Nodes (31): BentoLayoutPresetSchema, ClusterSurfaceToneSchema, GalleryApiResponseSchema, GalleryClusterConfigSchema, GalleryExecutionStage, GalleryExecutionStageSchema, GalleryFilterStateSchema, GalleryFocalPoint (+23 more)

### Community 11 - "UniversalMediaUpload.tsx"
Cohesion: 0.11
Nodes (32): DropzoneFileInput, DropzoneIdle(), DropzoneUploading(), MediaDropzoneView(), MediaDropzoneViewProps, useDropzoneDrag(), formatSize(), MediaActionButtons() (+24 more)

### Community 12 - "moments.mjs"
Cohesion: 0.09
Nodes (35): auditPage(), buildIndex(), cmdCheck(), cmdGallery(), cmdList(), cmdPick(), cmdServe(), cmdSheet() (+27 more)

### Community 13 - "generateSampleImage"
Cohesion: 0.13
Nodes (25): { bucket }, env, main(), testFileStream(), testHealth(), testLimitsAndSsrf(), testUploads(), create11MbPayload() (+17 more)

### Community 14 - "effects.mjs"
Cohesion: 0.08
Nodes (26): args, buildIndex(), checkFilters(), commands, ENUMS, FX, gallery(), INDEX (+18 more)

### Community 15 - "d1-cms-repository.ts"
Cohesion: 0.10
Nodes (27): ProjectGalleryViewerProps, mapMediaRecord(), mapMediaToGallery(), InsertKeyAccountRecord, KeyAccountRecord, keyAccountsTable, InsertLandingPlacementRecord, LandingPlacementRecord (+19 more)

### Community 16 - "LandingContext.tsx"
Cohesion: 0.21
Nodes (15): LandingContext, LandingContextValue, useCoreDisciplines(), useFeaturedProjects(), useLandingContext(), usePartnerBrands(), useProductionDivisions(), InHouseEngineering() (+7 more)

### Community 17 - "SafeUser"
Cohesion: 0.16
Nodes (9): AuthSession, D1UserRepository, mapToSafeUser(), mapToUser(), UserJoinedRow, IUserRepository, JsonUserRepository, SafeUser (+1 more)

### Community 18 - "api/src/index.ts"
Cohesion: 0.20
Nodes (12): DEV_ORIGINS, PRODUCTION_ORIGINS, resolveAllowedOrigin(), AppErrorStatusCode, app, adminAuthMiddleware(), AppEnv, authMiddleware() (+4 more)

### Community 19 - "perf.mjs"
Cohesion: 0.09
Nodes (24): args, B, child, cpuSnap(), die(), exited, guard, GZ (+16 more)

### Community 20 - "lucide-react"
Cohesion: 0.16
Nodes (16): metadata, ShopComingSoonPage(), useOptionalModalContext(), authenticateUser(), LoginForm(), LoginPageView(), HeaderMobileNav(), HeaderMobileNavProps (+8 more)

### Community 21 - "GalleryFilterBar.tsx"
Cohesion: 0.27
Nodes (9): CATEGORY_LABELS, FilterRadioGroup(), FilterRadioGroupProps, formatCategoryLabel(), GalleryFilterBar(), GalleryFilterSidebarProps, SEGMENT_OPTIONS, STAGE_OPTIONS (+1 more)

### Community 22 - "web/package.json"
Cohesion: 0.13
Nodes (21): devDependencies, prettier@^3.9.6, prettier-plugin-tailwindcss@^0.8.1, tailwindcss@^4.3.3, @tailwindcss/postcss@^4.3.3, @types/node@^20, @types/react@^19, @types/react-dom@^19 (+13 more)

### Community 23 - "shoot.mjs"
Cohesion: 0.09
Nodes (15): args, child, defaultProfile(), guard, HEIGHTS, kill(), MIME, out (+7 more)

### Community 24 - "galleryClusters.ts"
Cohesion: 0.13
Nodes (28): generateMetadata(), generateStaticParams(), PartnerPageProps, PartnerProjectsPage(), generateMetadata(), generateStaticParams(), SolutionPageProps, SolutionProjectsPage() (+20 more)

### Community 25 - "app/page.tsx"
Cohesion: 0.14
Nodes (22): Home(), LandingProvider(), LazyModalContainer(), ProjectLightboxModal, SpecAndProfileModal, ModalContext, ModalProvider(), ProfileModalType (+14 more)

### Community 26 - "user.ts"
Cohesion: 0.12
Nodes (15): Identity, IdentitySchema, IdentityType, IdentityTypeSchema, UserAccount, UserAccountSchema, AccessTokenPayloadSchema, AuthErrorCode (+7 more)

### Community 27 - "norm"
Cohesion: 0.14
Nodes (19): addressMod, areaMod, basicsMod, CDP, copyChecks(), copyTerms(), holds(), holdsAny() (+11 more)

### Community 28 - "runWidth"
Cohesion: 0.12
Nodes (23): auditFindings(), bySev(), clean(), clusterLooks(), extrasFindings(), groupLike(), groupSame(), invertedLook() (+15 more)

### Community 29 - "sleep"
Cohesion: 0.22
Nodes (14): cropTo(), deadIoPass(), glFallbackPass(), hiddenNow(), hiddenWalk(), lose(), narrowPass(), reducedPass() (+6 more)

### Community 30 - "ref_node_fs"
Cohesion: 0.15
Nodes (6): __dirname, __dirname, __dirname, initFullDatabase(), runSqlFile(), __dirname

### Community 31 - "D1CmsRepository"
Cohesion: 0.24
Nodes (3): D1CmsRepository, mapProject(), parseYear()

### Community 32 - "adminLeads.ts"
Cohesion: 0.33
Nodes (7): getAdminLeadByIdRoute, getAdminLeadsRoute, deleteAdminLeadRoute, updateAdminLeadStatusRoute, adminLeadsRouter, ContactLeadSchema, LeadStatusSchema

### Community 33 - "react"
Cohesion: 0.14
Nodes (21): useLegalInfo(), QuoteRequestModal(), CorporateProfileTab(), LegalAndFactorySection(), COLOR_TOKENS, WireframeSpecTab(), SpecAndProfileModal(), SpecAndProfileModalProps (+13 more)

### Community 34 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 35 - "sync.ts"
Cohesion: 0.15
Nodes (13): applyPendingChangesRoute, discardPendingChangeRoute, getPendingChangesRoute, getSyncStatusRoute, ApplyPendingResult, ApplyPendingResultSchema, ChangeActionTypeSchema, PendingChange (+5 more)

### Community 36 - "auth/authService.ts"
Cohesion: 0.38
Nodes (7): logoutUser(), apiClient(), ApiResult, getApiBaseUrl(), isInternalApiTarget(), createLead(), LoginResponseData

### Community 37 - "repositories/package.json"
Cohesion: 0.09
Nodes (22): dependencies, drizzle-orm@^0.45.4, @khangviet/data@workspace:*, @khangviet/types@workspace:*, devDependencies, drizzle-kit@^0.31.11, exports, @khangviet/data (+14 more)

### Community 38 - "JsonCmsRepository.ts"
Cohesion: 0.19
Nodes (10): buildProjectWhereConditions(), matchesSearch(), paginate(), LandingPlacement, LandingPlacementSlot, UpsertLandingPlacement, GalleryApiResponse, PaginationMeta (+2 more)

### Community 39 - "adminCms.ts"
Cohesion: 0.15
Nodes (17): MetaMutationResponse, updateHeroRoute, updateLegalRoute, deletePlacementRoute, getPlacementsRoute, upsertPlacementRoute, createProjectRoute, deleteProjectRoute (+9 more)

### Community 40 - "getRepositories"
Cohesion: 0.29
Nodes (7): getContextRepos(), ChangeHandleResult, handleCmsChange(), RevalidateOptions, triggerWebRevalidation(), WorkerEnvBindings, getRepositories()

### Community 41 - "types/src/index.ts"
Cohesion: 0.25
Nodes (7): useHeroSlides(), ProjectDossierInfo(), ProjectGalleryViewer(), ProjectLightboxModal(), HeroCarouselVisual(), HeroSection(), useCarousel()

### Community 42 - "seed-local-d1.mjs"
Cohesion: 0.11
Nodes (14): db, dbDir, dbPath, insertCmsMeta, insertIdentity, insertLead, insertMedia, insertProject (+6 more)

### Community 44 - "cms.ts"
Cohesion: 0.17
Nodes (14): dependencies, zod@^4.6.7, exports, main, name, type, types, version (+6 more)

### Community 45 - "tasks"
Cohesion: 0.12
Nodes (16): dependsOn, outputs, dependsOn, cache, persistent, dependsOn, $schema, cache (+8 more)

### Community 46 - "data/package.json"
Cohesion: 0.20
Nodes (10): dependencies, @khangviet/types@workspace:*, exports, ./seeds/*, @khangviet/types, main, name, type (+2 more)

### Community 47 - "api/package.json"
Cohesion: 0.09
Nodes (27): dependencies, hono@^4.13.2, @hono/zod-openapi@^1.6.3, @khangviet/data@workspace:*, @khangviet/repositories@workspace:*, @khangviet/types@workspace:*, @scalar/hono-api-reference@^0.12.16, devDependencies (+19 more)

### Community 48 - "assets_classify.py"
Cohesion: 0.22
Nodes (6): classify_ratio(), main(), make_new_name(), move_file(), process_image(), process_video()

### Community 49 - "block"
Cohesion: 0.26
Nodes (12): allow(), applyWaivers(), block(), errorReason(), guard, readJson(), readLedger(), record() (+4 more)

### Community 50 - "publicLeads.ts"
Cohesion: 0.31
Nodes (6): defaultValidationHook(), createLeadRoute, publicLeadsRouter, formatLeadMessage(), notifyNewLead(), TelegramEnvBindings

### Community 51 - "ImageCard.tsx"
Cohesion: 0.20
Nodes (10): cn(), clsx@^2.1.1, ExampleColor, FlickeringImage(), FlickeringImageProps, ImageCard(), ImageCardOrientation, ImageCardProps (+2 more)

### Community 52 - "seed.ts"
Cohesion: 0.11
Nodes (26): CmsMetadataRecord, cmsMetadataTable, PendingChangeRecord, pendingChangesTable, identitiesTable, IdentityRecord, InsertIdentityRecord, InsertLeadActivityRecord (+18 more)

### Community 53 - "FeaturedProject"
Cohesion: 0.07
Nodes (14): ModalContextValue, ProjectDossierInfoProps, ProjectLightboxModalProps, FooterProps, HeroCarouselVisualProps, HeroSectionProps, ProjectShowcaseProps, ProjectShowcaseDetailsProps (+6 more)

### Community 54 - "die"
Cohesion: 0.27
Nodes (9): CDP, die(), findChrome(), inProject(), launch(), perf(), serve(), shot() (+1 more)

### Community 55 - "test-challenger-deep-stress.mjs"
Cohesion: 0.18
Nodes (7): failures, loadTsModule(), require, service, targetFiles, ts, types

### Community 56 - "publicContent.ts"
Cohesion: 0.20
Nodes (9): getGalleryRoute, getLandingRoute, getProjectByIdRoute, getProjectsRoute, publicContentRouter, LandingContentSchema, FeaturedProjectSchema, ProjectDetailSchema (+1 more)

### Community 57 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, jsx, jsxImportSource, lib, module, moduleResolution, skipLibCheck, strict (+2 more)

### Community 58 - "compilerOptions"
Cohesion: 0.18
Nodes (10): compilerOptions, jsx, jsxImportSource, lib, module, moduleResolution, skipLibCheck, strict (+2 more)

### Community 59 - "test-media-upload.mjs"
Cohesion: 0.20
Nodes (9): filesToCheck, imageUrlInputContent, indexContent, loadTsModule(), mockWorkerSuccess, require, transformed, ts (+1 more)

### Community 60 - "package.json"
Cohesion: 0.20
Nodes (10): devDependencies, turbo@^2.10.10, packageManager, private, scripts, build, dev, dev:web (+2 more)

### Community 61 - "data/src/index.ts"
Cohesion: 0.10
Nodes (22): KeyAccountsSpotlightProps, ProjectCardProps, ProjectDetailDrawerProps, QuoteRequestModalProps, WIREFRAME_SPEC_TEXT, galleryExt, GalleryExtSeed, initialLandingContent (+14 more)

### Community 62 - "compilerOptions"
Cohesion: 0.20
Nodes (9): compilerOptions, declaration, module, moduleResolution, resolveJsonModule, skipLibCheck, strict, target (+1 more)

### Community 63 - "refsOf"
Cohesion: 0.22
Nodes (9): attrs(), cssRefs(), jsRefs(), kindOf(), local(), metas(), refsOf(), stripRef() (+1 more)

### Community 64 - "ref_node_assert"
Cohesion: 0.28
Nodes (3): json(), loginAdmin(), runTests()

### Community 65 - "BentoClusterSection.tsx"
Cohesion: 0.14
Nodes (19): metadata, ProjectsPage(), BentoClusterSection(), BentoClusterSectionProps, BentoPhotoTile(), BentoTile, buildBentoTiles(), getSurfaceClasses() (+11 more)

### Community 66 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, declaration, module, moduleResolution, skipLibCheck, strict, target, include

### Community 67 - "compilerOptions"
Cohesion: 0.22
Nodes (8): compilerOptions, declaration, module, moduleResolution, skipLibCheck, strict, target, include

### Community 69 - "auth.ts"
Cohesion: 0.18
Nodes (12): loginRoute, refreshRoute, getJwtSecret(), cleanupExpired(), createRateLimiter(), memoryStore, RateLimitEntry, RateLimitOptions (+4 more)

### Community 71 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, @khangviet/data@workspace:*, @khangviet/types@workspace:*, lucide-react@^1.57.0, next@16.4.3, react@19.2.8, react-dom@19.2.8, tailwind-merge@^3.6.0 (+4 more)

### Community 72 - "tilesMod"
Cohesion: 0.38
Nodes (7): tilesMod, call(), jumpTo(), sectionsProbe(), settleProbe(), shootTiles(), tilesOf()

### Community 73 - "analyse"
Cohesion: 0.33
Nodes (7): analyse(), count(), kb(), median(), rate(), spread(), timing()

### Community 75 - "Button.tsx"
Cohesion: 0.29
Nodes (5): ButtonProps, ButtonSize, ButtonVariant, sizeStyles, variantStyles

### Community 76 - "dotOf"
Cohesion: 0.43
Nodes (7): activeIn(), below(), dotOf(), findProject(), lastTouch(), traceFile(), unarmedPage()

### Community 77 - "applyFlags"
Cohesion: 0.40
Nodes (6): applyFlags(), fileAt(), findPage(), isUrl(), kindArg(), slash()

### Community 78 - "browserChecks"
Cohesion: 0.40
Nodes (6): browserChecks(), copyChecks(), errLine(), left(), parseJson(), rmProfile()

### Community 79 - "staticChecks"
Cohesion: 0.40
Nodes (6): codeOnly(), hashOf(), kitIndex(), kitTwin(), norm(), staticChecks()

### Community 80 - "opt"
Cohesion: 0.33
Nodes (6): freshProfile(), inProject(), opt(), profileBase(), roundsArg(), str()

### Community 81 - "allowBuilds"
Cohesion: 0.33
Nodes (5): allowBuilds, esbuild, unrs-resolver, workerd, packages

### Community 82 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 83 - "@hono/zod-openapi"
Cohesion: 0.47
Nodes (3): protectedRoute, protectedRouter, @hono/zod-openapi

### Community 84 - "shaderLint"
Cohesion: 0.50
Nodes (4): glslIn(), isGLSL(), lintGLSL(), shaderLint()

### Community 85 - "pnpm"
Cohesion: 0.67
Nodes (3): source-map-js, pnpm, overrides

### Community 87 - "eslint.config.mjs"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^10.13.0, eslint-config-next@16.4.3, eslint, eslint-config-next

## Knowledge Gaps
- **2 isolated node(s):** `RFC-9562`, `RFC-4122`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 648 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `lib()` connect `lib` to `consistency.mjs`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **Are the 51 inferred relationships involving `lib()` (e.g. with `arrive()` and `audit()`) actually correct?**
  _`lib()` has 51 INFERRED edges - model-reasoned connections that need verification._
- **What connects `RFC-9562`, `RFC-4122` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `lib` be split into smaller, more focused modules?**
  _Cohesion score 0.05791505791505792 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `BentoClusterSection.tsx`, `dependencies`, `types/src/index.ts`, `UniversalMediaUpload.tsx`, `Button.tsx`, `LandingContext.tsx`, `ImageCard.tsx`, `lucide-react`, `GalleryFilterBar.tsx`, `web/package.json`, `galleryClusters.ts`, `app/page.tsx`, `data/src/index.ts`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Should `photos.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.06128364389233954 - nodes in this community are weakly interconnected._
- **Why does `@hono/zod-openapi` connect `@hono/zod-openapi` to `adminLeads.ts`, `sync.ts`, `auth.ts`, `adminCms.ts`, `api/package.json`, `api/src/index.ts`, `publicLeads.ts`, `publicContent.ts`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._