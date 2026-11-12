# Quy Chuẩn Giao Tiếp & Thực Thi Tinh Gọn (Silent Execution & Milestone Updates)

Tài liệu này là ranh giới bắt buộc về phong cách giao tiếp của AI trong toàn bộ dự án nhằm tối ưu hóa token và thời gian của lập trình viên.

---

## 1. Cấm Tường Thuật Vụn Vặt Giữa Các Tool Call (No Step-by-Step Narration)
- **CẤM TUYỆT ĐỐI:** Xuất các dòng text tường thuật suy nghĩ hoặc hành động vụn vặt trước/giữa các lần gọi công cụ (ví dụ: *"Đọc file X..."*, *"Chạy lệnh Y..."*, *"Xem chỗ gọi hàm Z..."*).
- Quá trình đọc file, tra cứu, sửa code và chạy test phải diễn ra **hoàn toàn yên lặng (Silent Execution)**.

## 2. Thời Điểm Được Phép Xuất Text Phản Hồi Cho Người Dùng
AI chỉ xuất text phản hồi cho người dùng trong đúng 3 trường hợp sau:
1. **Báo Cáo Mốc Hoàn Thành (Milestone Completion):** Khi một giai đoạn lớn đã hoàn tất và vượt qua kiểm tra (kèm tóm tắt ngắn gọn các việc đã làm).
2. **Cần Quyết Định / Câu Hỏi Chặn (Blocking Questions):** Khi gặp thông tin mơ hồ hoặc cần người dùng xác nhận thiết kế/rủi ro.
3. **Báo Cáo Tổng Kết Cuối Cùng (Final Summary):** Trình bày kết quả sau khi task hoàn thành 100%.

## 3. Phong Cách Phản Hồi Khi Xuất Text
- Đi thẳng vào trọng tâm, sử dụng bullet points ngắn gọn.
- Không lặp lại những lời giải thích dài dòng hoặc chào hỏi không cần thiết.
