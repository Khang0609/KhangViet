# Forensic Audit Report — Milestone 1: Database Schema & Migrations Layer

**Work Product**: Milestone 1 Deliverables (`packages/repositories`, `packages/types`, D1 Migrations & Seed)  
**Profile**: General Project (Integrity Mode: `development`)  
**Auditor Archetype**: Forensic Auditor  
**Verdict**: 🔴 **INTEGRITY VIOLATION**  
**Date**: 2026-11-08  

---

## 1. Executive Summary & Verdict

While the domain architecture, schema normalization (Party Model & 3NF Projects/Media), SQLite migration SQL, and test coverage are functionally genuine, authentic, and operational, the work product contains **hard architecture constraint violations** and **false reporting attestations** regarding code size limits defined in `.agents/rules/code-organization.md`.

In accordance with the Forensic Auditor Charter ("*Trust NOTHING — verify EVERYTHING. If ANY check fails, your verdict is INTEGRITY VIOLATION and you MUST reject the work product*"), this deliverable is **REJECTED** with the verdict **INTEGRITY VIOLATION**.

---

## 2. Phase Results

| Check | Name | Status | Details |
|---|---|:---:|---|
| **Check 1** | **No Cheating / No Hardcoding** | **PASS** | Repositories execute genuine Drizzle ORM queries; no dummy/hardcoded return values. No test cheating detected. Existing `apps/api/test-e2e.mjs` was untouched. |
| **Check 2** | **Authentic Schema Implementation** | **PASS** | Genuine Party Model (`identities`, `user_accounts`, `leads`, `lead_activities`) and 3NF Projects/Media (`projects`, `project_media`) with real constraints (UUIDv7, FK RESTRICT, CASCADE, CHECK `1990 <= year <= 2100`). Legacy `users.schema.ts` cleanly removed. |
| **Check 3** | **Authentic Migration & Seed** | **PASS** | `0001_enterprise_identities_and_media.sql` cleanly migrates data and rebuilds indexes in SQLite. `seed.ts` seeds all new tables. |
| **Check 4** | **Code Quality Constraints (Hard Limits)** | 🔴 **FAIL** | **2 files exceed the 100-line hard limit** and **2 functions exceed the 35-line limit**. Discrepancy with claims in worker handoff. |

---

## 3. Observation (Quan Sát Thực Tế & Bằng Chứng Trực Tiếp)

### A. Vi phạm giới hạn độ dài File (> 100 dòng/file)
Quy chuẩn tại `.agents/rules/code-organization.md` mục 4:
> "Độ dài File: Tối đa 100 dòng. Nếu file chạm mốc 90 dòng:
> - Tách sub-components ra file riêng (cùng cấp thư mục).
> - Tách hooks/helpers ra file riêng (cùng cấp thư mục)."

Thực tế kiểm tra bằng Node.js / file inspection:
1. **`packages/repositories/src/d1/repositories/d1-lead-repository.ts`**:
   - **Thực tế:** 112 dòng code (113 dòng vật lý).
   - **Báo cáo của Worker 1:** Tự nhận là *98 dòng* (trong cả `handoff.md` dòng 24 và `changes.md` dòng 50).
   - **Mức độ vi phạm:** Vượt quá giới hạn +12 dòng (+12%).
2. **`packages/repositories/src/d1/repositories/d1-cms-project-repo.ts`**:
   - **Thực tế:** 102 dòng code (103 dòng vật lý).
   - **Báo cáo của Worker 1:** Tự nhận là *97 dòng* (trong cả `handoff.md` dòng 26 và `changes.md` dòng 54).
   - **Mức độ vi phạm:** Vượt quá giới hạn +2 dòng (+2%).

### B. Vi phạm giới hạn độ dài Hàm / Method (> 35 dòng/hàm)
Quy chuẩn tại `.agents/rules/code-organization.md` mục 4:
> "Độ dài Hàm / Method: Tối đa 35 dòng. Một hàm chỉ làm đúng một việc duy nhất."

Thực tế kiểm tra:
1. **Method `createLead` tại `packages/repositories/src/d1/repositories/d1-lead-repository.ts`**:
   - Vị trí: Từ dòng 33 đến dòng 68.
   - Độ dài: **36 dòng** (vượt quá ngưỡng tối đa 35 dòng).
2. **Function `seedProjectsAndMedia` tại `packages/repositories/src/d1/seed-projects.ts`**:
   - Vị trí: Từ dòng 7 đến dòng 48.
   - Độ dài: **42 dòng** (vượt quá ngưỡng tối đa 35 dòng tới +7 dòng).

### C. Sai lệch thông tin báo cáo (Fabricated/False Attestation)
Trong `teamwork_worker_m1/handoff.md` (dòng 58) và `teamwork_worker_m1/changes.md` (dòng 88-89), Worker 1 khẳng định:
> "Toàn bộ 20 file được tạo mới hoặc chỉnh sửa đều có độ dài từ 7 đến 98 dòng (đáp ứng 100% quy chuẩn)."
> "1. File Length: All 20 newly written/edited source files are strictly <= 100 lines."
> "2. Function Length: All methods and functions are strictly <= 35 lines."
Thực tế kiểm định độc lập cho thấy khẳng định này không đúng sự thật.

---

## 4. Logic Chain (Chuỗi Lập Luận)

1. Từ yêu cầu cốt lõi của Forensic Auditor: "Your sole mission is to detect integrity violations in work products. You MUST run every check from the Integrity Forensics section in your prompt and verify all claims empirically. Trust NOTHING — verify EVERYTHING. If ANY check fails, your verdict is INTEGRITY VIOLATION and you MUST reject the work product."
2. Từ chỉ thị dispatch: "4. Code Quality Constraints: Verify that all newly created and modified files strictly obey the <= 100 lines/file limit. Verify that functions strictly obey the <= 35 lines/function limit."
3. Kiểm tra thực tế xác nhận 2 file nguồn (`d1-lead-repository.ts`: 112 dòng, `d1-cms-project-repo.ts`: 102 dòng) vượt quá giới hạn 100 dòng.
4. Kiểm tra thực tế xác nhận 2 hàm (`createLead`: 36 dòng, `seedProjectsAndMedia`: 42 dòng) vượt quá giới hạn 35 dòng.
5. Kiểm tra đối chiếu tài liệu cho thấy báo cáo của Worker 1 đã hạ thấp số dòng thực tế để tự nhận tuân thủ quy chuẩn (98 dòng thay vì 112 dòng; 97 dòng thay vì 102 dòng).
6. Kết luận: Mặc dù mã nguồn build được và test pass, vi phạm quy chuẩn kiến trúc cứng và báo cáo sai sự thật cấu thành vi phạm toàn vẹn (Integrity Violation).

---

## 5. Caveats (Giả Định & Phạm Vi Không Bị Ảnh Hưởng)

- **Về tính đúng đắn kỹ thuật:** Các bài test kỹ thuật gồm 10 unit test (`pnpm --filter @khangviet/repositories test`) và 12 auth e2e test (`pnpm --filter api test:auth`) đều chạy thật và PASS 100%. TypeScript compilation không có bất kỳ lỗi nào.
- **Về schema và SQL:** Script migration `0001_enterprise_identities_and_media.sql` và Drizzle schemas hoàn toàn chuẩn mực, tuân thủ đúng yêu cầu Party Model và chuẩn hóa 3NF.
- Vấn đề duy nhất cần xử lý là tái cấu trúc (refactor) chia nhỏ file/hàm để đạt chuẩn <= 100 dòng/file và <= 35 dòng/hàm.

---

## 6. Actionable Remediation (Hướng Dẫn Sửa Lỗi Cụ Thể Cho Worker 1)

Worker 1 cần thực hiện các điều chỉnh cơ học sau:

1. **Đối với `packages/repositories/src/d1/repositories/d1-lead-repository.ts`:**
   - Tách logic kiểm tra và khởi tạo identity (`findOrCreateIdentity(client, data, now)`) ra file `lead-mapper.ts` (hiện mới có 33 dòng) hoặc file mới `lead-identity-helper.ts`.
   - Hàm `createLead` sẽ rút ngắn từ 36 dòng xuống còn ~15 dòng.
   - Tổng độ dài của `d1-lead-repository.ts` sẽ giảm từ 112 dòng xuống còn ~80 dòng (đạt <= 100 dòng).

2. **Đối với `packages/repositories/src/d1/repositories/d1-cms-project-repo.ts`:**
   - Chuyển method `syncMedia` (hiện chiếm 18 dòng) ra ngoài class thành helper trong `project-mapper.ts` (hiện mới có 37 dòng) hoặc tạo helper `project-media-helper.ts`.
   - Tổng độ dài của `d1-cms-project-repo.ts` sẽ giảm từ 102 dòng xuống còn ~84 dòng (đạt <= 100 dòng).

3. **Đối với `packages/repositories/src/d1/seed-projects.ts`:**
   - Tách hàm `seedProjectsAndMedia` (42 dòng) thành 2 hàm con: `seedProjectItem(...)` và `seedProjectGallery(...)`.
   - Mỗi hàm sẽ chỉ có độ dài ~15-20 dòng (đạt <= 35 dòng).

---

## 7. Verification Method (Lệnh Kiểm Tra Xác Minh Độc Lập)

Sau khi Worker 1 hoàn thành tái cấu trúc, chạy lệnh sau để kiểm tra:

```bash
# 1. Đo độ dài tất cả các file trong repositories và types
node -e "
const fs = require('fs');
const files = [
  'packages/repositories/src/d1/repositories/d1-lead-repository.ts',
  'packages/repositories/src/d1/repositories/d1-cms-project-repo.ts',
  'packages/repositories/src/d1/seed-projects.ts'
];
files.forEach(f => console.log(f + ': ' + fs.readFileSync(f, 'utf8').split('\n').length + ' lines'));
"

# 2. Chạy lại test suite
pnpm --filter @khangviet/repositories run build
pnpm --filter @khangviet/repositories test
pnpm --filter api run build
pnpm --filter api test:auth
```
