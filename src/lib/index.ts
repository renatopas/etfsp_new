import dayjs from "dayjs";
import { default as relativeTime } from "dayjs/plugin/relativeTime";
import { default as pt } from "dayjs/locale/pt";

dayjs.extend(relativeTime);
dayjs.locale(pt);

export function prettyDateOffset(date: dayjs.ConfigType): string {
  return dayjs(date).fromNow();
}
