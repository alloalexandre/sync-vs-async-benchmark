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
  sync: { success: 0, fail: 0, totalTime: 0 },
  async: { success: 0, fail: 0, totalTime: 0 },
};

function nowMs() {
  return performance.now();
}

function readFileSyncOperation() {
  const filePath = getRandomFilePath();
  return readFileSync(filePath, "utf-8");
}

async function readFileAsyncOperation() {
  const filePath = getRandomFilePath();
  return await fs.readFile(filePath, "utf-8");
}

const server = Bun.serve({
  port: 3000,
  fetch: async (req) => {
    const url = new URL(req.url);
    const start = nowMs();

    if (url.pathname === "/sync") {
      try {
        readFileSyncOperation();
        const elapsed = nowMs() - start;
        stats.sync.success += 1;
        stats.sync.totalTime += elapsed;
        return new Response("OK");
      } catch (err) {
        stats.sync.fail += 1;
        return new Response("Read failed", { status: 500 });
      }
    }

    if (url.pathname === "/async") {
      try {
        await readFileAsyncOperation();
        const elapsed = nowMs() - start;
        stats.async.success += 1;
        stats.async.totalTime += elapsed;
        return new Response("OK");
      } catch (err) {
        stats.async.fail += 1;
        return new Response("Read failed", { status: 500 });
      }
    }

    if (url.pathname === "/stats") {
      const { sync, async } = stats;

      const syncAvg = sync.success > 0 ? sync.totalTime / sync.success : 0;
      const asyncAvg = async.success > 0 ? async.totalTime / async.success : 0;

      const requestDelta =
        sync.success > 0
          ? (((async.success - sync.success) / sync.success) * 100).toFixed(2)
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
          totalRequests: sync.success + sync.fail,
          successful: sync.success,
          failed: sync.fail,
          averageTimeMs: syncAvg.toFixed(2),
        },
        async: {
          totalRequests: async.success + async.fail,
          successful: async.success,
          failed: async.fail,
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
        sync: { success: 0, fail: 0, totalTime: 0 },
        async: { success: 0, fail: 0, totalTime: 0 },
      };
      return new Response("Stats reset");
    }

    return new Response("Not found", { status: 404 });
  },
});

console.log(`Server running on http://localhost:${server.port}`);
