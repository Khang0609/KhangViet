---
name: git-branch-workflow
description: Quy trình kiểm soát nhánh Git khi làm việc đa nhiệm (Context Switching) và quy tắc Pre-Commit Branch Verification. Kích hoạt khi chuẩn bị stage/commit, chuyển đổi qua lại giữa các phiên làm việc (auth, database, web UI, CMS), hoặc khi thực hiện tác vụ trên workspace có nhiều nhánh song song để ngăn chặn commit nhầm nhánh (mixed concerns / dirty git history).
---

# Kỹ Năng Quản Lý Nhánh Git Khi Làm Việc Đa Nhiệm (Git Branch & Context Switching Guard)

## 1. Bối Cảnh & Vấn Đề Cốt Lõi

Khi làm việc với nhiều phiên chat hoặc đa tác vụ song song (ví dụ: một phiên xử lý Database D1, một phiên xử lý Auth & Bảo mật, một phiên làm Web UI):
- Workspace cục bộ chỉ có **một con trỏ HEAD (nhánh hiện tại)** tại một thời điểm.
- AI rất dễ mắc bẫy **Blind Commit** (tự động chạy `git add` và `git commit` trực tiếp mà không kiểm tra nhánh hiện tại), dẫn đến việc commit nhầm code của tính năng này vào nhánh của tính năng khác, làm hỏng lịch sử commit và gây xung đột nghiêm trọng.

---

## 2. Nguyên Tắc Cốt Lõi: Pre-Commit Branch Gate (Cấm Blind Commit)

Trước khi chạm vào bất kỳ lệnh `git add` hoặc `git commit` nào, AI **BẮT BUỘC** thực hiện quy trình 3 bước:

```
[Bắt đầu commit]
       │
       ▼
1. VERIFY: Kiểm tra `git branch --show-current` và `git status`
       │
       ▼
2. RECONCILE: Đối chiếu nội dung thay đổi với nhánh mục tiêu
       │
   ┌───┴────────────────────────┐
[Khớp nhánh]              [Lệch nhánh]
   │                            │
   ▼                            ▼
Stage & Commit             3. SAFE SWITCH WORKFLOW:
                           - Báo cáo và xin chỉ thị / tự động chuyển an toàn
                           - Checkout target branch -> Commit -> Quay lại original branch
```

### Bước 1: Verify (Xác minh nhánh hiện hành)
- Luôn chạy:
  ```powershell
  git branch --show-current
  git status -s
  ```
- **Tuyệt đối KHÔNG giả định** workspace đang ở đúng nhánh mong muốn.

### Bước 2: Reconcile (Đối chiếu Ngữ Cảnh Tác Vụ)
- Phân tích danh sách file thay đổi và xác định thuộc phạm vi (domain) nào:
  - **Auth / Bảo mật / Audit:** Nhánh `feature/auth-...` hoặc liên quan authentication.
  - **Database D1 / Migrations / Repositories:** Nhánh `feature/d1-...` hoặc database layer.
  - **Web / Frontend / Landing Page:** Nhánh liên quan UI / Web.
  - **CMS / Admin:** Nhánh liên quan Admin CMS.
- So sánh domain của task với kết quả `git branch --show-current`:
  - **Trùng khớp:** Tiến hành quy trình commit thông thường.
  - **Lệch nhánh:** DỪNG LẠI và kích hoạt ngay **Safe Context Switch Workflow**.

---

## 3. Safe Context Switch Workflow (Quy Trình Chuyển Nhánh An Toàn)

Khi phát hiện thay đổi thuộc nhánh B nhưng workspace đang đứng ở nhánh A:

### Kịch bản 1: Chỉ có các file thuộc tính năng mục tiêu bị sửa đổi (Working tree sạch các phần khác)
1. Chuyển sang nhánh mục tiêu:
   ```powershell
   git checkout <target-branch>
   ```
2. Kiểm tra lại trạng thái sau khi chuyển:
   ```powershell
   git status
   ```
3. Stage có chọn lọc (chỉ add đúng các file liên quan) và commit:
   ```powershell
   git add <cac-file-can-commit>
   git commit -m "<type>(<scope>): <mo-ta-ngan-gon>"
   ```
4. Trả workspace về nhánh ban đầu nếu người dùng vẫn đang làm dở tác vụ trước đó:
   ```powershell
   git checkout <original-branch>
   ```

### Kịch bản 2: Working tree đang có cả file của nhánh A lẫn nhánh B (Hỗn hợp thay đổi)
1. **CẤM** chạy `git add .` bừa bãi.
2. Dùng `git stash` hoặc chọn lọc file:
   - Nếu git cho phép checkout mang theo file sửa đổi: Hãy dùng `git checkout <target-branch>` kèm kiểm tra xung đột.
   - Nếu bị cản trở bởi conflict khi checkout: Sử dụng `git stash push -m "wip: temp stash before context switch" <cac-file-nhanh-A>` trước khi chuyển nhánh.
3. Luôn báo cáo minh bạch cho người dùng về trạng thái các tệp.

---

## 4. Checklist Hành Động Bắt Buộc Cho Agent (Agent Checklist)

Mỗi khi nhận lệnh commit từ người dùng:

- [ ] **1. Check Current Branch:** Chạy `git branch --show-current`.
- [ ] **2. Inspect Changed Files:** Chạy `git status --short` để thấy rõ danh sách tệp đã thay đổi.
- [ ] **3. Branch Matching Decision:**
  - Nhánh hiện tại có đúng với nội dung cần commit không?
  - Nếu **ĐÚNG**: Stage file cụ thể $\rightarrow$ Commit.
  - Nếu **SAI**:
    1. Thông báo rõ: *"Workspace hiện đang ở nhánh `[X]`, nhưng các thay đổi này thuộc nhánh `[Y]`. Đang chuyển sang `[Y]` để commit..."*
    2. Thực hiện switch sang nhánh `[Y]`.
    3. Commit.
    4. Checkout lại nhánh `[X]` (nếu cần tiếp tục tác vụ của `[X]`).
- [ ] **4. Final Report:** Báo cáo rõ commit hash, nhánh đã ghi nhận, và nhánh hiện tại của workspace sau khi hoàn thành.
