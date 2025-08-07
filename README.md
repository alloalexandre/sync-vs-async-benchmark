# Synchronous vs Asynchronous

This project is a minimal benchmark setup using Bun to demonstrate the impact of synchronous vs asynchronous operations on server performance.

It compares two endpoints:

- `/sync`: Reads a file **synchronously**, blocking the event loop.
- `/async`: Reads the same file **asynchronously**, allowing concurrent processing.

The benchmark is designed to make the performance difference obvious by simulating a real-world task (file reading) and measuring request throughput and average latency.

## Goals

- Show how **synchronous operations** block the event loop and degrade performance under load.
- Show how **asynchronous operations** allow concurrent request handling, resulting in higher throughput.
- Provide a simple, reproducible test environment with automated benchmarking.

## How It Works

1. A large (~5MB) text file (`large.txt`) is generated.
2. The server exposes two endpoints:
   - `/sync` reads the file using `fs.readFileSync`.
   - `/async` reads the file using `fs.promises.readFile`.
3. Stats are recorded for each endpoint:
   - Total number of requests handled.
   - Average time taken per request.
4. A `/stats` endpoint returns the aggregated stats in JSON.
5. A `/reset` endpoint clears the stats to prepare for a new test.

## Requirements

- [Bun](https://bun.sh/) installed
- `autocannon` (for load testing)
- `jq` (for pretty-printing JSON)

Install the tools if needed:

```bash
npm install -g autocannon # or bun add -g autocannon
brew install jq   # or use your package manager
```

## Setup

1. Clone or download this repository.
2. Install Bun dependencies (if any).
3. Start the server:

```bash
bun index.ts
```

## Run the Benchmark

In another terminal, run the benchmark script:

```bash
./benchmark.sh
```

This script will:

- Reset stats via `/reset`
- Run `autocannon` for 10 seconds on `/sync`
- Run `autocannon` for 10 seconds on `/async`
- Fetch and display the `/stats` JSON response

## Example Output

```json
{
  "sync": {
    "totalRequests": 218,
    "averageTimeMs": "52.41"
  },
  "async": {
    "totalRequests": 1875,
    "averageTimeMs": "51.87"
  },
  "comparison": {
    "asyncMoreRequestsPercent": "759.63%",
    "asyncFasterAvgTimePercent": "1.03%"
  }
}
```

## Interpretation

- The `/sync` endpoint handles far fewer requests because each call blocks the event loop.
- The `/async` endpoint supports far more concurrent requests since file reading is non-blocking.
- Even though the per-request time is similar, the server's ability to handle multiple requests at once is drastically different.

## Forcing Actual Disk I/O

To avoid unfair caching behavior (especially from Bun or the OS), this benchmark setup uses 100 unique 5MB files stored in `./data/`.

Each request (whether sync or async) reads a randomly selected file from this directory. This prevents repeated reads from hitting memory or disk cache, and makes the benchmark reflect actual I/O costs more accurately.

You can generate the files using:

```bash
./generate-files.sh
```

This creates approximately 500MB of test data.

## License

MIT
