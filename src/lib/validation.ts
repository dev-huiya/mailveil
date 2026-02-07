const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export function isValidEmail(email: string): boolean {
  return (
    typeof email === "string" &&
    email.length > 0 &&
    email.length <= 254 &&
    EMAIL_REGEX.test(email)
  );
}

export function isValidId(id: string): boolean {
  return (
    typeof id === "string" && id.length > 0 && id.length <= 64 && ID_REGEX.test(id)
  );
}

export function isValidRuleName(name: string): boolean {
  return typeof name === "string" && name.length > 0 && name.length <= 255;
}

export function validateCreateRule(body: unknown): string | null {
  if (!body || typeof body !== "object") return "Invalid request body";

  const { name, enabled, matchers, actions } = body as Record<string, unknown>;

  if (typeof name !== "string" || !isValidRuleName(name as string))
    return "Invalid rule name";
  if (typeof enabled !== "boolean") return "Invalid enabled flag";

  if (!Array.isArray(matchers) || matchers.length === 0)
    return "Invalid matchers";
  for (const m of matchers) {
    if (!m || typeof m !== "object") return "Invalid matcher";
    const { type, field, value } = m as Record<string, unknown>;
    if (type !== "literal" && type !== "all") return "Invalid matcher type";
    if (type === "literal") {
      if (field !== "to") return "Invalid matcher field";
      if (typeof value !== "string" || !isValidEmail(value))
        return "Invalid matcher email";
    }
  }

  if (!Array.isArray(actions) || actions.length === 0) return "Invalid actions";
  for (const a of actions) {
    if (!a || typeof a !== "object") return "Invalid action";
    const { type, value } = a as Record<string, unknown>;
    if (type !== "forward" && type !== "drop") return "Invalid action type";
    if (type === "forward") {
      if (!Array.isArray(value) || value.length === 0)
        return "Forward action requires destination emails";
      for (const email of value) {
        if (typeof email !== "string" || !isValidEmail(email))
          return "Invalid forward destination email";
      }
    }
  }

  return null;
}

export function validateUpdateRule(body: unknown): string | null {
  return validateCreateRule(body);
}
