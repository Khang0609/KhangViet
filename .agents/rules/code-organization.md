# Quy tắc Tổ chức Mã nguồn (Khang Việt Design)

## 1. Giới hạn độ dài tệp: Không quá 100 dòng
- Mọi tệp nguồn (`.tsx`, `.ts`, `.js`, `.css`) KHÔNG ĐƯỢC vượt quá 100 dòng code, trừ trường hợp bất khả dĩ tuyệt đối.
- Khi một component hoặc file có xu hướng đạt/vượt 100 dòng:
  - Bắt buộc tách các custom hook ra tệp hook riêng.
  - Bắt buộc tách các sub-component nhỏ hơn ra tệp component riêng.

## 2. Nguyên tắc Colocation (Cùng cấp thư mục)
- Các hook hoặc sub-component được tách ra **phải đặt trong cùng thư mục (sibling level)** với component cha đang sử dụng nó.
- **Không tự ý chuyển lên thư mục chung (root, shared, lib)** khi code đó chỉ phục vụ cho một component hoặc feature cục bộ.
- Chỉ chuyển hook/component lên cấp dùng chung khi có từ **2 feature/folder khác nhau** thực sự tái sử dụng nó.
