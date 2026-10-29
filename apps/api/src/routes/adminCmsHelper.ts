import { Context } from "hono";
import { getRepositories } from "@khangviet/repositories";
import type { ChangeActionType } from "@khangviet/types";
import { triggerWebRevalidation } from "../services/revalidateNotifier";

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

  // Tự động kích hoạt On-demand ISR revalidation sang Web app
  await triggerWebRevalidation({ tag: "cms-landing" });

  return { isPending: false, result };
}
