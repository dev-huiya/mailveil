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

// --- Helper ---

function makeId(): string {
  return Math.random().toString(36).slice(2, 14);
}

function wrap<T>(result: T): CloudflareResponse<T> {
  return { success: true, errors: [], messages: [], result };
}

function now(): string {
  return new Date().toISOString();
}

// --- Seed data ---

const DOMAIN = process.env.EMAIL_DOMAIN || "example.com";
const DEST_EMAIL = `address-you-actually-use@${DOMAIN}`;

let rules: EmailRoutingRule[] = [
  {
    id: makeId(),
    tag: makeId(),
    name: "Shopping",
    priority: 0,
    enabled: true,
    matchers: [{ type: "literal", field: "to", value: `shopping@${DOMAIN}` }],
    actions: [{ type: "forward", value: [DEST_EMAIL] }],
  },
  {
    id: makeId(),
    tag: makeId(),
    name: "Newsletter",
    priority: 1,
    enabled: true,
    matchers: [{ type: "literal", field: "to", value: `newsletter@${DOMAIN}` }],
    actions: [{ type: "forward", value: [DEST_EMAIL] }],
  },
  {
    id: makeId(),
    tag: makeId(),
    name: "Social (disabled)",
    priority: 2,
    enabled: false,
    matchers: [{ type: "literal", field: "to", value: `social@${DOMAIN}` }],
    actions: [{ type: "forward", value: [DEST_EMAIL] }],
  },
];

let catchAll: CatchAllRule = {
  tag: makeId(),
  name: "catch-all",
  enabled: false,
  matchers: [{ type: "all" }],
  actions: [{ type: "drop" }],
};

let destinations: Destination[] = [
  {
    id: makeId(),
    email: DEST_EMAIL,
    verified: now(),
    created: now(),
    modified: now(),
    tag: makeId(),
  },
  {
    id: makeId(),
    email: `backup@${DOMAIN}`,
    verified: null,
    created: now(),
    modified: now(),
    tag: makeId(),
  },
];

let settings: EmailRoutingSettings = {
  id: makeId(),
  tag: makeId(),
  name: DOMAIN,
  enabled: true,
  created: now(),
  modified: now(),
  skip_wizard: true,
  status: "ready",
};

// --- Rules ---

export async function listRules(): Promise<CloudflareResponse<EmailRoutingRule[]>> {
  return wrap(rules);
}

export async function getRule(id: string): Promise<CloudflareResponse<EmailRoutingRule>> {
  const rule = rules.find((r) => r.id === id);
  if (!rule) throw new Error(`Rule ${id} not found`);
  return wrap(rule);
}

export async function createRule(data: CreateRuleRequest): Promise<CloudflareResponse<EmailRoutingRule>> {
  const rule: EmailRoutingRule = {
    id: makeId(),
    tag: makeId(),
    name: data.name,
    priority: rules.length,
    enabled: data.enabled,
    matchers: data.matchers,
    actions: data.actions,
  };
  rules.push(rule);
  return wrap(rule);
}

export async function updateRule(id: string, data: UpdateRuleRequest): Promise<CloudflareResponse<EmailRoutingRule>> {
  const idx = rules.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error(`Rule ${id} not found`);
  rules[idx] = { ...rules[idx], ...data };
  return wrap(rules[idx]);
}

export async function deleteRule(id: string): Promise<CloudflareResponse<EmailRoutingRule>> {
  const idx = rules.findIndex((r) => r.id === id);
  if (idx === -1) throw new Error(`Rule ${id} not found`);
  const [removed] = rules.splice(idx, 1);
  return wrap(removed);
}

// --- Catch-All ---

export async function getCatchAll(): Promise<CloudflareResponse<CatchAllRule>> {
  return wrap(catchAll);
}

export async function updateCatchAll(data: {
  enabled: boolean;
  matchers: { type: "all" }[];
  actions: { type: "forward" | "drop"; value?: string[] }[];
}): Promise<CloudflareResponse<CatchAllRule>> {
  catchAll = { ...catchAll, ...data };
  return wrap(catchAll);
}

// --- Destinations ---

export async function listDestinations(): Promise<CloudflareResponse<Destination[]>> {
  return wrap(destinations);
}

export async function getDestination(id: string): Promise<CloudflareResponse<Destination>> {
  const dest = destinations.find((d) => d.id === id);
  if (!dest) throw new Error(`Destination ${id} not found`);
  return wrap(dest);
}

export async function createDestination(email: string): Promise<CloudflareResponse<Destination>> {
  const dest: Destination = {
    id: makeId(),
    email,
    verified: null,
    created: now(),
    modified: now(),
    tag: makeId(),
  };
  destinations.push(dest);
  return wrap(dest);
}

export async function deleteDestination(id: string): Promise<CloudflareResponse<Destination>> {
  const idx = destinations.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error(`Destination ${id} not found`);
  const [removed] = destinations.splice(idx, 1);
  return wrap(removed);
}

// --- Settings ---

export async function getSettings(): Promise<CloudflareResponse<EmailRoutingSettings>> {
  return wrap(settings);
}

export async function enableEmailRouting(): Promise<CloudflareResponse<EmailRoutingSettings>> {
  settings = { ...settings, enabled: true, status: "ready", modified: now() };
  return wrap(settings);
}

export async function disableEmailRouting(): Promise<CloudflareResponse<EmailRoutingSettings>> {
  settings = { ...settings, enabled: false, status: "disabled", modified: now() };
  return wrap(settings);
}
