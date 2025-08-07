import json
import os
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime

results_dir = "results"
data = []

# Load all result JSON files
for filename in sorted(os.listdir(results_dir)):
    if filename.endswith(".json"):
        with open(os.path.join(results_dir, filename)) as f:
            stats = json.load(f)
            timestamp = filename.replace("benchmark_", "").replace(".json", "")
            data.append({
                "timestamp": datetime.strptime(timestamp, "%Y%m%d_%H%M%S"),
                "sync_requests": stats["sync"]["totalRequests"],
                "sync_avg_ms": float(stats["sync"]["averageTimeMs"]),
                "async_requests": stats["async"]["totalRequests"],
                "async_avg_ms": float(stats["async"]["averageTimeMs"]),
                "async_more_requests_pct": float(stats["comparison"]["asyncMoreRequestsPercent"].replace("%", "")) if stats["comparison"]["asyncMoreRequestsPercent"] != "N/A" else 0,
                "async_faster_time_pct": float(stats["comparison"]["averageTimeDifferencePercent"].replace("%", "")) if stats["comparison"]["averageTimeDifferencePercent"] != "N/A" else 0,
            })

# Convert to DataFrame
df = pd.DataFrame(data)
df.set_index("timestamp", inplace=True)

# Plot 1: Total Requests
df[["sync_requests", "async_requests"]].plot(kind="bar", figsize=(12, 6))
plt.title("Total Requests: Sync vs Async")
plt.ylabel("Requests")
plt.xlabel("Benchmark Timestamp")
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("results/plot_total_requests.png")
plt.clf()

# Plot 2: Average Response Time
df[["sync_avg_ms", "async_avg_ms"]].plot(kind="bar", figsize=(12, 6))
plt.title("Average Request Time (ms): Sync vs Async")
plt.ylabel("Milliseconds")
plt.xlabel("Benchmark Timestamp")
plt.xticks(rotation=45)
plt.tight_layout()
plt.savefig("results/plot_avg_time.png")
plt.clf()

print("Plots saved to results/:")
print(" - plot_total_requests.png")
print(" - plot_avg_time.png")
