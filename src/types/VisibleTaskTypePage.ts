import type { VisibleTaskType } from "./VisibleTaskType";
export type VisibleTaskTypePage = {
  items: VisibleTaskType[];
  next_after: string | null;
  total: number;
};
