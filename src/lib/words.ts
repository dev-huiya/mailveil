export interface Category {
  id: string;
  name: string;
  emoji: string;
  words: string[];
}

export const categories: Category[] = [
  {
    id: "shopping",
    name: "Shopping",
    emoji: "\uD83D\uDED2",
    words: [
      "cart", "deal", "shop", "store", "order", "buy", "sale", "mall",
      "gift", "brand", "price", "market", "trade", "stock", "item",
      "goods", "retail", "offer", "promo", "value", "bargain", "haul",
      "wish", "basket", "coupon", "refund", "pack", "trend", "style", "pick",
    ],
  },
  {
    id: "social",
    name: "Social",
    emoji: "\uD83D\uDCAC",
    words: [
      "chat", "feed", "post", "like", "share", "link", "group", "friend",
      "follow", "ping", "buzz", "wave", "meet", "club", "loop",
      "vibe", "crowd", "tribe", "circle", "spark", "bond", "sync",
      "voice", "story", "react", "emoji", "trend", "meme", "snap", "tag",
    ],
  },
  {
    id: "finance",
    name: "Finance",
    emoji: "\uD83D\uDCB0",
    words: [
      "bank", "cash", "coin", "fund", "loan", "pay", "bill", "tax",
      "save", "earn", "gain", "asset", "rate", "debt", "credit",
      "stock", "bond", "trade", "yield", "profit", "ledger", "vault",
      "wallet", "check", "swift", "wire", "audit", "budget", "mint", "gold",
    ],
  },
  {
    id: "gaming",
    name: "Gaming",
    emoji: "\uD83C\uDFAE",
    words: [
      "game", "play", "quest", "hero", "level", "boss", "raid", "loot",
      "arena", "guild", "team", "score", "combo", "skill", "rank",
      "pixel", "sword", "shield", "craft", "spawn", "buff", "mod",
      "steam", "retro", "epic", "tower", "dungeon", "rogue", "mage", "dash",
    ],
  },
  {
    id: "dev",
    name: "Dev",
    emoji: "\uD83D\uDCBB",
    words: [
      "code", "git", "bug", "api", "node", "app", "data", "dev",
      "test", "log", "push", "pull", "hack", "bit", "byte",
      "stack", "rust", "docker", "cloud", "build", "deploy", "debug",
      "linux", "shell", "script", "merge", "branch", "func", "type", "loop",
    ],
  },
  {
    id: "newsletter",
    name: "Newsletter",
    emoji: "\uD83D\uDCF0",
    words: [
      "news", "read", "daily", "weekly", "digest", "brief", "pulse", "alert",
      "report", "update", "press", "media", "blog", "article", "post",
      "review", "guide", "tip", "insight", "trend", "recap", "flash",
      "morning", "evening", "headline", "scoop", "draft", "issue", "topic", "note",
    ],
  },
  {
    id: "general",
    name: "General",
    emoji: "\u2728",
    words: [
      "star", "moon", "sun", "wind", "rain", "wave", "peak", "glow",
      "spark", "drift", "echo", "pulse", "bloom", "frost", "shade",
      "mist", "dusk", "dawn", "pine", "reed", "stone", "creek",
      "leaf", "cloud", "ember", "coral", "sage", "iris", "jade", "onyx",
    ],
  },
];
