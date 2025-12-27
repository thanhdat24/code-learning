import express from "express";
import cors from "cors";
import { getMongoClient, getDbName, getUsersCollection } from "./mongo";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Basic healthcheckS
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/users/:username", async (req, res) => {
  const username = String(req.params.username || "").trim();
  if (!username) return res.status(400).json({ error: "Invalid username" });

  const client = await getMongoClient();
  const db = client.db(getDbName());
  const users = db.collection(getUsersCollection());

  const user = await users.findOne({ username });
  // ✅ thay vì 404
  return res.json(user ? user : null);
});

app.put("/api/users/:username", async (req, res) => {
  try {
    const username = String(req.params.username || "").trim();
    if (!username) return res.status(400).json({ error: "Invalid username" });

    // Minimal validation/sanitization (don't trust the browser)
    const body = req.body ?? {};
    if (typeof body !== "object") {
      return res.status(400).json({ error: "Invalid JSON body" });
    }
    if (body.username !== username) {
      return res
        .status(400)
        .json({ error: "Username in URL must match body.username" });
    }

    const safeUser = {
      username,
      solvedProblemIds: Array.isArray(body.solvedProblemIds)
        ? body.solvedProblemIds.filter((x: unknown) => typeof x === "string")
        : [],
      points: Number.isFinite(body.points) ? Number(body.points) : 0,
      submissions: Array.isArray(body.submissions) ? body.submissions : [],
    };

    const client = await getMongoClient();
    const db = client.db(getDbName());
    const users = db.collection(getUsersCollection());

    await users.updateOne({ username }, { $set: safeUser }, { upsert: true });

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
