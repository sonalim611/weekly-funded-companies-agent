import type { Startup } from "./startups";

const YC_META_URL = "https://yc-oss.github.io/api/meta.json";
const RECENT_BATCH_COUNT = 2;
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

async function getRecentBatchApis(): Promise<string[]> {
  const meta = await fetchJson<YCMeta>(YC_META_URL);

  return Object.values(meta.batches)
    .filter((batch) => batch.count > 0)
    .sort((a, b) => batchSortKey(b.name) - batchSortKey(a.name))
    .slice(0, RECENT_BATCH_COUNT)
    .map((batch) => batch.api);
}

export async function fetchWeeklyStartups(): Promise<{
  startups: Startup[];
  fetchedAt: string;
  source: string;
  weekStart: string;
  weekEnd: string;
  usedFallback: boolean;
}> {
  const batchApis = await getRecentBatchApis();
  const companies: YCCompany[] = [];

  for (const api of batchApis) {
    const batchCompanies = await fetchJson<YCCompany[]>(api);
    companies.push(...batchCompanies);
  }

  const lookbackSeconds = LOOKBACK_DAYS * 24 * 60 * 60;
  const cutoff = Math.floor(Date.now() / 1000) - lookbackSeconds;
  const now = new Date();

  const active = companies
    .filter((c) => c.status === "Active")
    .sort((a, b) => b.launched_at - a.launched_at);

  const weekly = active.filter((c) => c.launched_at >= cutoff);
  const usedFallback = weekly.length < MIN_WEEKLY_COUNT;

  const selected = usedFallback ? active.slice(0, MAX_FALLBACK) : weekly;

  const weekEnd = now.toISOString().split("T")[0];
  const weekStart = new Date(now.getTime() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return {
    startups: selected.map(toStartup),
    fetchedAt: now.toISOString(),
    source: "Y Combinator (yc-oss/api)",
    weekStart,
    weekEnd,
    usedFallback,
  };
}

export async function getStartupById(id: string): Promise<Startup | undefined> {
  const { startups } = await fetchWeeklyStartups();
  return startups.find((s) => s.id === id);
}
