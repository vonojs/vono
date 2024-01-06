import { LogLevel, createLogger } from "@gaiiaa/logger";

export const log = createLogger({
  name: "vono",
  level: LogLevel.DEBUG,
});
