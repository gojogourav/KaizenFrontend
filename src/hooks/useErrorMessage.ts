export function extractErrorMessage(err: any, fallback: string): string {
  if (!err) return fallback;
  const isUsable = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && !v.includes('[object Object]');

  if (isUsable(err)) return err;
  if (isUsable(err.message)) return err.message;
  if (isUsable(err.error)) return err.error;
  if (isUsable(err.error?.message)) return err.error.message;
  if (isUsable(err.detail)) return err.detail;
  if (isUsable(err.data)) return err.data;
  if (isUsable(err.data?.message)) return err.data.message;
  if (isUsable(err.data?.detail)) return err.data.detail;
  if (isUsable(err.data?.error)) return err.data.error;
  return fallback;
}
