type TitleCaseKind = 'Title Case' | 'lower case' | 'kabob-case' | 'snake_case' | string;

function normalizeKind(kind: TitleCaseKind): TitleCaseKind {
  const k: string = String(kind || '').trim();
  if (!k) return 'Title Case';
  const lower = k.toLowerCase();
  if (lower === 'title case' || lower === 'title_case' || lower === 'titlecase') return 'Title Case';
  if (lower === 'lower case' || lower === 'lower_case') return 'lower case';
  if (lower === 'kabob-case' || lower === 'kebab-case') return 'kabob-case';
  if (lower === 'snake_case' || lower === 'snake case') return 'snake_case';
  return k;
}

export function filenameToTitle(filename: string, kind: TitleCaseKind = 'Title Case'): string {
  const safeFilename: string = String(filename ?? '');
  if (!safeFilename) return '';

  const normalized: TitleCaseKind = normalizeKind(kind);
  if (normalized === 'kabob-case') return safeFilename;

  // Treat both hyphens and underscores as word boundaries.
  const parts: string[] = safeFilename.split(/[-_]/g).filter(Boolean);
  if (parts.length === 0) return safeFilename;

  if (normalized === 'snake_case') {
    return parts.map((p) => p.toLowerCase()).join('_');
  }

  if (normalized === 'lower case') {
    return parts.map((p) => p.toLowerCase()).join(' ');
  }

  // Default: Title Case
  return parts
    .map((p) => {
      const lower = p.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

