const KEY = (id: string | number) => `ra.admin.users.row.${id}`;

export function stashAdminUserRowForEdit(id: string | number, record: Record<string, unknown>): void {
  try {
    sessionStorage.setItem(KEY(id), JSON.stringify(record));
  } catch {
  }
}

export function readAdminUserRowCache(id: string | number): Record<string, unknown> | null {
  try {
    const raw = sessionStorage.getItem(KEY(id));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}
