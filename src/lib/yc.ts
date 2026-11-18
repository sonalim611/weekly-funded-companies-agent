import type { Startup } from "./startups";

const YC_META_URL = "https://yc-oss.github.io/api/meta.json";
const RECENT_BATCH_COUNT = 2;
const MAX_BATCHES_TO_FETCH = 4;
const MIN_BATCH_COMPANIES = 10;
const MIN_COMPANY_POOL = 80;
const LOOKBACK_DAYS = 7;
const MIN_WEEKLY_COUNT = 10;
const MAX_FALLBACK = 40;

interface YCMeta {
  batches: Record<string, { name: string; count: number; api: string }>;
}

export interface YCCompany {
  id: number;
  name: string;
  slug: string;
  website: string;
  all_locations: string;
  long_description: string;
  one_liner: string;
  industry: string;
  subindustry: string;
  launched_at: number;
  batch: string;
  status: string;
  isHiring: boolean;
  url: string;
  stage: string;
}

function batchSortKey(batchName: string): number {
  const match = batchName.match(/(Winter|Spring|Summer|Fall)\s+(\d{4})/i);
  if (!match) return 0;

  const seasonOrder: Record<string, number> = {
    winter: 4,
    spring: 3,
    summer: 2,
    fall: 1,
  };

  const year = parseInt(match[2], 10);
  const season = seasonOrder[match[1].toLowerCase()] ?? 0;
  return year * 10 + season;
}

function toStartup(company: YCCompany): Startup {
  const description =
    company.long_description?.trim() || company.one_liner?.trim() || "No description available.";

  const industry = company.subindustry
    ? company.subindustry.replace(" -> ", " / ")
    : company.industry;

  return {
    id: company.slug,
    name: company.name,
    fundingAmount: `YC ${company.batch} (pre-seed)`,
    description,
    industry,
    batch: company.batch,
    website: company.website,
    url: company.url,
    isHiring: company.isHiring,
    location: company.all_locations,
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Pick newest YC batches, skipping tiny placeholder batches, until we have
 * a usable company pool (avoids Winter/Summer 2027 stubs with ~15 total).
 */
async function getRecentBatchApis(): Promise<string[]> {
  const meta = await fetchJson<YCMeta>(YC_META_URL);

  const sorted = Object.values(meta.batches)
    .filter((batch) => batch.count > 0)
    .sort((a, b) => batchSortKey(b.name) - batchSortKey(a.name));

  const substantial = sorted.filter((batch) => batch.count >= MIN_BATCH_COMPANIES);
  const pool = substantial.length > 0 ? substantial : sorted;

  const selected: typeof pool = [];
  let total = 0;

  for (const batch of pool) {
    selected.push(batch);
    total += batch.count;
    if (selected.length >= RECENT_BATCH_COUNT && total >= MIN_COMPANY_POOL) {
      break;
    }
    if (selected.length >= MAX_BATCHES_TO_FETCH) {
      break;
    }
  }

  return selected.map((batch) => batch.api);
}

async function loadRecentCompanies(): Promise<YCCompany[]> {
  const batchApis = await getRecentBatchApis();
  const companies: YCCompany[] = [];

  for (const api of batchApis) {
    const batchCompanies = await fetchJson<YCCompany[]>(api);
    companies.push(...batchCompanies);
  }

  return companies;
}

export async function fetchWeeklyStartups(): Promise<{
  startups: Startup[];
  fetchedAt: string;
  source: string;
  weekStart: string;
  weekEnd: string;
  usedFallback: boolean;
}> {
  const companies = await loadRecentCompanies();

  const lookbackSeconds = LOOKBACK_DAYS * 24 * 60 * 60;
  const cutoff = Math.floor(Date.now() / 1000) - lookbackSeconds;
  const now = new Date();

  const active = companies
    .filter((c) => c.status === "Active" && typeof c.slug === "string" && c.slug.trim().length > 0)
    .sort((a, b) => b.launched_at - a.launched_at);

  const weekly = active.filter((c) => c.launched_at >= cutoff);
  const usedFallback = weekly.length < MIN_WEEKLY_COUNT;

  const selected = usedFallback ? active.slice(0, MAX_FALLBACK) : weekly;
  const startups = selected.map(toStartup);

  const weekEnd = now.toISOString().split("T")[0];
  const weekStart = new Date(now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return {
    startups,
    fetchedAt: now.toISOString(),
    source: "Y Combinator (yc-oss/api)",
    weekStart,
    weekEnd,
    usedFallback,
  };
}

/**
 * Validate startupId against live YC data from recent batches (full pool,
 * not the truncated dashboard list of 40).
 */
export async function getStartupById(id: string): Promise<Startup | undefined> {
  const normalizedId = typeof id === "string" ? id.trim() : "";
  if (!normalizedId) {
    console.warn("[yc] getStartupById called with empty id");
    return undefined;
  }

  const companies = await loadRecentCompanies();
  const activeMatch = companies.find(
    (c) => c.status === "Active" && c.slug === normalizedId,
  );
  const anyMatch = activeMatch ?? companies.find((c) => c.slug === normalizedId);

  if (!anyMatch?.slug) {
    console.warn("[yc] Startup not found in recent YC batches", {
      startupId: normalizedId,
      poolCount: companies.length,
    });
    return undefined;
  }

  return toStartup(anyMatch);
}
