/**
 * Shared utilities for CSV import: parsing, format conversion, report types.
 *
 * Strategy:
 *  - Strip UTF-8 BOM that Excel often prepends.
 *  - Use csv-parse (RFC 4180) to handle quoted fields, escaped quotes, and
 *    newlines inside values — issues a hand-rolled parser would miss.
 *  - Convert tabular rows to header-keyed objects so import logic can read
 *    fields by their human-readable column name (matches export format).
 */
import { parse } from 'csv-parse/sync';

export type ImportRowStatus = 'create' | 'update' | 'error';

export interface ImportRowError {
  /** Column name or sub-field where the problem is. Empty for row-wide issues. */
  field?: string;
  message: string;
}

export interface ImportRowResult {
  /** 1-based row number in the source file (excluding header). */
  rowNum: number;
  /** Human identifier for the row — strain identifier or sample code. */
  identifier?: string;
  status: ImportRowStatus;
  errors: ImportRowError[];
}

export interface ImportSummary {
  total: number;
  toCreate: number;
  toUpdate: number;
  errors: number;
}

export interface ImportReport {
  summary: ImportSummary;
  rows: ImportRowResult[];
}

/**
 * Parse a CSV buffer (typically from multer) into a list of header-keyed
 * objects. Throws on malformed CSV — caller should catch and surface as
 * a top-level import error.
 */
export function parseCsvBuffer(buffer: Buffer): {
  headers: string[];
  rows: Record<string, string>[];
} {
  let text = buffer.toString('utf8');
  // Strip UTF-8 BOM
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }
  if (!text.trim()) {
    return { headers: [], rows: [] };
  }

  const matrix = parse(text, {
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    bom: true,
  });

  if (matrix.length === 0) {
    return { headers: [], rows: [] };
  }

  const [rawHeader, ...body] = matrix;
  const headers = rawHeader.map((h) => h.trim());

  const rows = body.map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (row[i] ?? '').trim();
    });
    return obj;
  });

  return { headers, rows };
}

/**
 * Build a summary from row results. Single source of truth so all importers
 * report identical shape.
 */
export function buildSummary(rows: ImportRowResult[]): ImportSummary {
  const summary: ImportSummary = {
    total: rows.length,
    toCreate: 0,
    toUpdate: 0,
    errors: 0,
  };
  for (const r of rows) {
    if (r.status === 'create') summary.toCreate += 1;
    else if (r.status === 'update') summary.toUpdate += 1;
    else summary.errors += 1;
  }
  return summary;
}

/* ------------------------------------------------------------------ */
/*  Reverse parsers for aggregated columns produced by export                */
/* ------------------------------------------------------------------ */

/**
 * Parse storage allocation column produced by `joinStorage`.
 * Format: "Box A:1*; Box B:2" — `*` suffix marks primary.
 */
export function parseStorageColumn(
  value: string,
): Array<{ box: string; cell: string; isPrimary: boolean }> {
  if (!value) return [];
  return value
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => {
      const isPrimary = part.endsWith('*');
      const clean = isPrimary ? part.slice(0, -1).trim() : part;
      const colonIdx = clean.lastIndexOf(':');
      if (colonIdx < 0) {
        return { box: clean, cell: '', isPrimary };
      }
      return {
        box: clean.slice(0, colonIdx).trim(),
        cell: clean.slice(colonIdx + 1).trim(),
        isPrimary,
      };
    });
}

/**
 * Parse phenotypes column produced by `joinPhenotypes`.
 * Format: "Gram Stain=positive (Microscopy); Amylase=true"
 *  - method captured from a trailing parenthesised group
 *  - units (if exported) end up appended to the value, callers can
 *    strip them based on the trait definition
 */
export function parsePhenotypesColumn(
  value: string,
): Array<{ name: string; value: string; method?: string }> {
  if (!value) return [];
  return value
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((part) => {
      const methodMatch = part.match(/\s*\(([^)]+)\)\s*$/);
      const method = methodMatch ? methodMatch[1].trim() : undefined;
      const withoutMethod =
        methodMatch && methodMatch.index !== undefined
          ? part.slice(0, methodMatch.index).trim()
          : part;
      const eqIdx = withoutMethod.indexOf('=');
      if (eqIdx < 0) {
        return { name: withoutMethod, value: '', method };
      }
      return {
        name: withoutMethod.slice(0, eqIdx).trim(),
        value: withoutMethod.slice(eqIdx + 1).trim(),
        method,
      };
    });
}

/**
 * Parse "Strain Identifiers" column (semicolon-separated list).
 * Used for sample import to ignore the column (read-only — strains are
 * imported via their own endpoint).
 */
export function parseSemicolonList(value: string): string[] {
  if (!value) return [];
  return value
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Coerce CSV string to optional number. Returns undefined for empty.
 * Returns null if the value is non-empty but not numeric — caller treats
 * null as a validation error.
 */
export function parseOptionalNumber(value: string): number | undefined | null {
  if (!value) return undefined;
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

/**
 * Coerce CSV string to optional ISO date. Returns undefined for empty.
 * Returns null if the value is non-empty but not parseable.
 *
 * Accepts ISO (2024-03-15), DD.MM.YYYY (15.03.2024), and toLocaleDateString
 * variants — Excel often ships locale-dependent formats.
 */
export function parseOptionalDate(value: string): Date | undefined | null {
  if (!value) return undefined;
  const trimmed = value.trim();

  // ISO yyyy-mm-dd or full ISO
  const iso = new Date(trimmed);
  if (!Number.isNaN(iso.getTime())) return iso;

  // dd.mm.yyyy or dd/mm/yyyy
  const m = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (!Number.isNaN(d.getTime())) return d;
  }

  return null;
}

/** True if the trimmed string represents an explicit boolean truthy value. */
export function parseBooleanLoose(value: string): boolean | undefined {
  if (!value) return undefined;
  const v = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'positive', '+', 'да'].includes(v)) return true;
  if (['false', '0', 'no', 'n', 'negative', '-', 'нет'].includes(v))
    return false;
  return undefined;
}

/**
 * Convert any error thrown during import-row commit into a short, safe
 * message suitable to show in the UI.
 *
 * Why: Prisma's default error message embeds absolute file paths, line
 * numbers, and stack traces — leaking infrastructure details into the
 * client and overwhelming users with noise. We map common known errors
 * to human-readable summaries and fall back to a sanitised first line
 * for the rest.
 */
export function formatImportError(err: unknown): string {
  // Prisma errors expose `code` and structured `meta` — use them when
  // available to produce a precise message.
  const e = err as {
    code?: string;
    meta?: Record<string, unknown>;
    message?: string;
  };

  if (typeof e?.code === 'string') {
    switch (e.code) {
      case 'P2002': {
        // Unique constraint violation. `meta.target` is usually an array
        // of field names (or a constraint name as string).
        const target = e.meta?.target;
        const fields = Array.isArray(target)
          ? target.join(', ')
          : typeof target === 'string'
            ? target
            : 'unknown';
        const model =
          typeof e.meta?.modelName === 'string' ? ` (${e.meta.modelName})` : '';
        return `Conflict on ${fields}${model}: a record with these values already exists`;
      }
      case 'P2003': {
        const field =
          typeof e.meta?.field_name === 'string'
            ? ` on ${e.meta.field_name}`
            : '';
        return `Foreign key constraint failed${field}: referenced record does not exist`;
      }
      case 'P2025':
        return `Record not found`;
      case 'P2000':
        return `Value too long for the field`;
      default:
        // Fall through to message-based extraction
        break;
    }
  }

  // Fallback: take only the first line and strip any "Invalid `xxx` invocation
  // in C:\path\to\file.ts:123" prefix that Prisma prepends.
  const raw = e?.message ?? String(err);
  const firstLine = raw.split(/\r?\n/)[0].trim();
  const cleaned = firstLine
    .replace(/Invalid `[^`]+` invocation in [^\s]+/i, '')
    .replace(/at [A-Z]:\\[^\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || 'Database operation failed';
}
