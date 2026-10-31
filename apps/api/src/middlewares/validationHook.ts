import { Hook } from "@hono/zod-openapi";

export const defaultValidationHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    const firstIssue = result.error.issues?.[0];
    const pathStr = firstIssue?.path ? firstIssue.path.join(".") : "";
    const detail = firstIssue
      ? `${pathStr ? `[${pathStr}] ` : ""}${firstIssue.message}`
      : "Dữ liệu yêu cầu không hợp lệ";

    return c.json(
      {
        success: false,
        error: detail,
      },
      400
    );
  }
};

