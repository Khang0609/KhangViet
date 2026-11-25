# Khang Việt Design — Feature Map

Maps every critical route to its user flow and automated verification proof (`scripts/verify-app.mjs`).

| Route | Area | What Proves It Works |
| :--- | :--- | :--- |
| `/` | Public Landing | Renders hero, disciplines, engineering divisions, and footer with 0 console errors and 0 `/api/*` >= 400 responses. |
| `/projects` | Gallery Hub | Renders partner and solution clusters ordered by project count with 0 console/API errors. |
| `/projects/partners/bidv` | Partner SplitView | Renders cluster project list, detail preview, and 3D/actual toggle with 0 console/API errors. |
| `/projects/solutions/bang-hieu-mat-dung` | Solution SplitView | Renders solution cluster projects cleanly with 0 console/API errors. |
| `/admin` | Admin Hub | Localhost dev bypass loads Admin Hub without `401 Unauthorized` and 0 console errors. |
| `/admin/projects` | Admin Projects | Loads projects table from `/api/v1/admin/cms/*` with 0 `4xx/5xx` or console errors. |
| `/admin/projects/he-thong-nhan-dien-mat-tien-quay-giao-dich-chuoi-ngan-hang-bidv` | Media & 3D Editor | Loads single-project media list and 3D-vs-Actual comparison selector cleanly. |
| `/admin/partners` | Admin Partners | Loads partner organizations list and controls with 0 `4xx/5xx` or console errors. |
| `/admin/leads` | Admin Leads | Loads CRM leads list from `/api/v1/admin/leads` with 0 `4xx/5xx` or console errors. |
