import { Context } from "hono";

export const errorHandler = async (err: Error, c: Context) => {
  // Bắt lỗi Content-Type không được hỗ trợ (Schemathesis gửi text/plain vào JSON endpoint)
  if (
    err.message.includes("Unsupported Media Type") ||
    err.message.includes("Content-Type")
  ) {
    return c.json(
      {
        success: false,
        error: "Unsupported Media Type",
      },
      415,
    );
  }

  // Bắt lỗi cú pháp JSON khi client gửi payload hỏng hoặc chứa byte bất thường
  if (
    err instanceof SyntaxError ||
    err.message.includes("Malformed JSON in request body") ||
    err.message.includes("JSON")
  ) {
    return c.json(
      {
        success: false,
        error: "Malformed JSON in request body",
      },
      400,
    );
  }

  // Bắt lỗi không tìm thấy tài nguyên từ repository
  if (err.message.toLowerCase().includes("not found")) {
    return c.json(
      {
        success: false,
        error: err.message,
      },
      404,
    );
  }

  console.error(`[API ERROR] ${c.req.method} ${c.req.url}:`, err);
  return c.json(
    {
      success: false,
      error: err.message || "Internal Server Error",
    },
    500,
  );
};
