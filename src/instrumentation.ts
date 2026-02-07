export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && !process.env.JWT_SECRET) {
    const { randomBytes } = await import("crypto");
    process.env.JWT_SECRET = randomBytes(32).toString("hex");
  }
}
