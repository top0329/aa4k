import { RedisEmptyRecord } from "../types"

// redis空レコード判定
export function isRedisEmptyRecord(record: Record<string, string>): record is RedisEmptyRecord {
  return Object.keys(record).length === 0;
}