import { Context } from "hono";
import { getRepositories } from "@khangviet/repositories";
import type { ChangeActionType } from "@khangviet/types";

export interface ChangeHandleResult {
  isPending: boolean;
  result: unknown;
}

export async function handleCmsChange(
  c: Context,
  action: ChangeActionType,
  payload: unknown,
  targetId?: string
): Promise<ChangeHandleResult> {
  const repos = getRepositories();
  const force = c.req.query("force") === "true";
  const isMidnight = repos.cms.isMidnightWindow();

  // Áp dụng trực tiếp nếu đang trong khung giờ 00:00 - 02:00 hoặc có cờ force
  if (isMidnight || force) {
    let result: unknown;
    switch (action) {
      case "CREATE_PROJECT":
        result = await repos.cms.createProject(payload as any);
        break;
      case "UPDATE_PROJECT":
        result = await repos.cms.updateProject(targetId!, payload as any);
        break;
      case "DELETE_PROJECT":
        result = await repos.cms.deleteProject(targetId!);
        break;
      case "UPDATE_HERO":
        result = await repos.cms.updateHeroSlides(payload as any);
        break;
      case "UPDATE_LEGAL":
        result = await repos.cms.updateLegalInfo(payload as any);
        break;
    }
    return { isPending: false, result };
  }

  // Ngoài khung giờ: đưa vào hàng đợi Pending
  const pending = await repos.cms.enqueueChange(action, payload, targetId);
  return { isPending: true, result: pending };
}

