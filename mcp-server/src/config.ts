export const config = {
  database: {
    url: process.env.DATABASE_URL || "postgresql://openbrain:openbrain@localhost:5432/openbrain",
  },
  vault: {
    path: process.env.VAULT_PATH || "/vault",
  },
  radicale: {
    url: process.env.RADICALE_URL || "http://localhost:5232",
    user: process.env.RADICALE_USER || "artur",
    password: process.env.RADICALE_PASSWORD || "",
  },
};
