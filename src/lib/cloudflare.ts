import "server-only";
import type {
  CloudflareResponse,
  EmailRoutingRule,
  CatchAllRule,
  Destination,
  EmailRoutingSettings,
  CreateRuleRequest,
  UpdateRuleRequest,
} from "@/types/cloudflare";

const CF_API_TOKEN = process.env.CF_API_TOKEN!;
const CF_ZONE_ID = process.env.CF_ZONE_ID!;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID!;
const CF_BASE_URL = "https://api.cloudflare.com/client/v4";

async function cfFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<CloudflareResponse<T>> {
  const url = `${CF_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${CF_API_TOKEN}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = (await response.json()) as CloudflareResponse<T>;

  if (!data.success) {
    const errorMsg = data.errors?.map((e) => e.message).join(", ") || "Unknown error";
    throw new Error(`Cloudflare API error: ${errorMsg}`);
  }

  return data;
}

// Rules
export async function listRules() {
  return cfFetch<EmailRoutingRule[]>(
    `/zones/${CF_ZONE_ID}/email/routing/rules?per_page=50`
  );
}

export async function getRule(id: string) {
  return cfFetch<EmailRoutingRule>(
    `/zones/${CF_ZONE_ID}/email/routing/rules/${id}`
  );
}

export async function createRule(data: CreateRuleRequest) {
  return cfFetch<EmailRoutingRule>(
    `/zones/${CF_ZONE_ID}/email/routing/rules`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function updateRule(id: string, data: UpdateRuleRequest) {
  return cfFetch<EmailRoutingRule>(
    `/zones/${CF_ZONE_ID}/email/routing/rules/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

export async function deleteRule(id: string) {
  return cfFetch<EmailRoutingRule>(
    `/zones/${CF_ZONE_ID}/email/routing/rules/${id}`,
    {
      method: "DELETE",
    }
  );
}

// Catch-All
export async function getCatchAll() {
  return cfFetch<CatchAllRule>(
    `/zones/${CF_ZONE_ID}/email/routing/rules/catch_all`
  );
}

export async function updateCatchAll(data: {
  enabled: boolean;
  matchers: { type: "all" }[];
  actions: { type: "forward" | "drop"; value?: string[] }[];
}) {
  return cfFetch<CatchAllRule>(
    `/zones/${CF_ZONE_ID}/email/routing/rules/catch_all`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

// Destinations
export async function listDestinations() {
  return cfFetch<Destination[]>(
    `/accounts/${CF_ACCOUNT_ID}/email/routing/addresses`
  );
}

export async function getDestination(id: string) {
  return cfFetch<Destination>(
    `/accounts/${CF_ACCOUNT_ID}/email/routing/addresses/${id}`
  );
}

export async function createDestination(email: string) {
  return cfFetch<Destination>(
    `/accounts/${CF_ACCOUNT_ID}/email/routing/addresses`,
    {
      method: "POST",
      body: JSON.stringify({ email }),
    }
  );
}

export async function deleteDestination(id: string) {
  return cfFetch<Destination>(
    `/accounts/${CF_ACCOUNT_ID}/email/routing/addresses/${id}`,
    {
      method: "DELETE",
    }
  );
}

// Settings
export async function getSettings() {
  return cfFetch<EmailRoutingSettings>(
    `/zones/${CF_ZONE_ID}/email/routing`
  );
}

export async function enableEmailRouting() {
  return cfFetch<EmailRoutingSettings>(
    `/zones/${CF_ZONE_ID}/email/routing/enable`,
    { method: "POST" }
  );
}

export async function disableEmailRouting() {
  return cfFetch<EmailRoutingSettings>(
    `/zones/${CF_ZONE_ID}/email/routing/disable`,
    { method: "POST" }
  );
}
