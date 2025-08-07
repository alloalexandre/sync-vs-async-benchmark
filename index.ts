import { readFileSync, promises as fs } from "fs";
import { join } from "path";

const FILE_COUNT = 100;
const FILE_DIR = "./data";

const getRandomFilePath = () => {
  const id = String(Math.floor(Math.random() * FILE_COUNT) + 1).padStart(
    2,
    "0"
  );
  return join(FILE_DIR, `file_${id}.txt`);
};

let stats = {
  sync: { count: 0, totalTime: 0 },
  async: { count: 0, totalTime: 0 },
};

function nowMs() {
  return performance.now();
}

function readFileSyncOperation() {
  const filePath = getRandomFilePath();
  readFileSync(filePath, "utf-8");
}

async function readFileAsyncOperation() {
  const filePath = getRandomFilePath();
  await fs.readFile(filePath, "utf-8");
}

const server = Bun.serve({
  port: 3000,
  fetch: async (req) => {
    const url = new URL(req.url);
    const start = nowMs();

    if (url.pathname === "/sync") {
      readFileSyncOperation();
      const elapsed = nowMs() - start;
      stats.sync.count += 1;
      stats.sync.totalTime += elapsed;
      return new Response("OK");
    }

    if (url.pathname === "/async") {
      await readFileAsyncOperation();
      const elapsed = nowMs() - start;
      stats.async.count += 1;
      stats.async.totalTime += elapsed;
      return new Response("OK");
    }

    if (url.pathname === "/stats") {
      const { sync, async } = stats;

      const syncAvg = sync.count > 0 ? sync.totalTime / sync.count : 0;
      const asyncAvg = async.count > 0 ? async.totalTime / async.count : 0;

      const requestDelta =
        sync.count > 0
          ? (((async.count - sync.count) / sync.count) * 100).toFixed(2)
          : "N/A";

      const timeDelta =
        syncAvg > 0
          ? (((syncAvg - asyncAvg) / syncAvg) * 100).toFixed(2)
          : "N/A";

      const slowdownRatio =
        syncAvg > 0 && asyncAvg > 0
          ? (asyncAvg / syncAvg).toFixed(2) + "x"
          : "N/A";

      return Response.json({
        sync: {
          totalRequests: sync.count,
          averageTimeMs: syncAvg.toFixed(2),
        },
        async: {
          totalRequests: async.count,
          averageTimeMs: asyncAvg.toFixed(2),
        },
        comparison: {
          asyncMoreRequestsPercent: requestDelta + "%",
          averageTimeDifferencePercent: timeDelta + "%",
          averageTimeAsyncSlowerThanSync: slowdownRatio,
        },
      });
    }

    if (url.pathname === "/reset") {
      stats = {
        sync: { count: 0, totalTime: 0 },
        async: { count: 0, totalTime: 0 },
      };
      return new Response("Stats reset");
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Server running on http://localhost:${server.port}`);
