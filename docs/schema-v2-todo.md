# Schema v2 Follow-up Notes (2026-11-24)

## 1. Gallery Cluster Ordering & Layout Editor Decision
- **Cluster Ordering**: Public `/projects` gallery clusters (both Partner clusters and Technical Solution / Service clusters) should auto-order by project count (most projects first), rather than relying on a dedicated `/admin/gallery` reordering page.
- **Open Architecture Question for `/admin/projects/[slug]`**:
  - Currently, clicking a project row in `/admin/projects` navigates to `/admin/projects/[slug]` (`AdminGallerySlugClient.tsx`), which in Schema v2 only renders a plain list of cards (redundant with `/admin/projects`).
  - **Decision needed tomorrow**:
    1. Should we support per-cluster **Bento Layout Preset** (`hero-left`, `asymmetric-mosaic`, `panoramic-trio`, `editorial-split`) and **Slot Assignment** (stored in `site_settings` under `gallery_clusters` for services + `organizations` or a `partner_clusters` setting for partners)?
    2. Or should `/admin/projects/[slug]` be replaced by a **Project Detail / Media & 3D-vs-Actual Comparison Editor** for that single project (since Schema v2 already has `project_media` and `project_comparisons`)?
