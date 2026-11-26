import React from "react";
import { Check } from "lucide-react";

interface ContactSuccessViewProps {
  onReset: () => void;
}

export const ContactSuccessView: React.FC<ContactSuccessViewProps> = ({
  onReset,
}) => {
  return (
    <div className="mt-8 flex min-h-64 flex-col items-center justify-center border border-(--border-bronze-subtle) bg-(--accent-bronze)/5 p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-(--accent-bronze) text-black">
        <Check className="h-6 w-6" />
      </span>
      <h4 className="font-syne mt-5 text-xl font-bold">
        Đã ghi nhận yêu cầu
      </h4>
      <p className="mt-2 text-sm text-(--text-secondary)">
        Khang Việt sẽ liên hệ với bạn trong thời gian sớm nhất.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="mt-5 cursor-pointer text-xs tracking-wider text-(--accent-bronze) uppercase"
      >
        Gửi yêu cầu khác
      </button>
    </div>
  );
};
