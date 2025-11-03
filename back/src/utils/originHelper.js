const DEFAULT_DEV_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

function unique(values) {
  return Array.from(new Set(values));
}

export function resolveAllowedOrigins() {
  const raw = process.env.FRONT_ORIGIN || "";
  const parsed = raw
    .split(/[\s,|]+/)
    .map(value => value.trim())
    .filter(Boolean);

  const fromEnv = unique(parsed);

  if (process.env.NODE_ENV !== "production") {
    return unique([...DEFAULT_DEV_ORIGINS, ...fromEnv]);
  }

  return fromEnv.length ? fromEnv : DEFAULT_DEV_ORIGINS;
}
