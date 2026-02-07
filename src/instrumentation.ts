export async function register() {
  if (!process.env.JWT_SECRET) {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      const { randomBytes } = await import("crypto");
      process.env.JWT_SECRET = randomBytes(32).toString("hex");
    } else {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      process.env.JWT_SECRET = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
    }
  }
}
