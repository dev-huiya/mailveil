export interface CloudflareResponse<T> {
  success: boolean;
  errors: CloudflareError[];
  messages: CloudflareMessage[];
  result: T;
  result_info?: ResultInfo;
}

export interface CloudflareError {
  code: number;
  message: string;
}

export interface CloudflareMessage {
  code: number;
  message: string;
}

export interface ResultInfo {
  page: number;
  per_page: number;
  total_pages: number;
  count: number;
  total_count: number;
}

export interface EmailRoutingRule {
  id: string;
  tag: string;
  name: string;
  priority: number;
  enabled: boolean;
  matchers: RuleMatcher[];
  actions: RuleAction[];
}

export interface RuleMatcher {
  type: "literal";
  field: "to";
  value: string;
}

export interface RuleAction {
  type: "forward" | "drop";
  value: string[];
}

export interface CatchAllRule {
  tag: string;
  name: string;
  enabled: boolean;
  matchers: CatchAllMatcher[];
  actions: CatchAllAction[];
}

export interface CatchAllMatcher {
  type: "all";
}

export interface CatchAllAction {
  type: "forward" | "drop";
  value?: string[];
}

export interface Destination {
  id: string;
  email: string;
  verified: string | null;
  created: string;
  modified: string;
  tag: string;
}

export interface EmailRoutingSettings {
  id: string;
  tag: string;
  name: string;
  enabled: boolean;
  created: string;
  modified: string;
  skip_wizard: boolean;
  status: string;
}

export interface CreateRuleRequest {
  name: string;
  enabled: boolean;
  matchers: RuleMatcher[];
  actions: RuleAction[];
}

export interface UpdateRuleRequest {
  name: string;
  enabled: boolean;
  matchers: RuleMatcher[];
  actions: RuleAction[];
}
