#!/bin/bash

# Configuration
SERVER_URL="http://localhost:3000"
DURATION=30             # Duration per round (seconds)
CONNECTIONS=1000        # Number of concurrent connections
PIPELINE=10             # Enable pipelining: number of requests per connection
ROUNDS=2                # Number of rounds per endpoint

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULTS_DIR="results"
RESULT_FILE="$RESULTS_DIR/benchmark_$TIMESTAMP.json"
LOG_FILE="$RESULTS_DIR/benchmark_$TIMESTAMP.log"

# Create results directory if not exists
mkdir -p "$RESULTS_DIR"

# Reset stats
echo "Resetting stats..." | tee "$LOG_FILE"
curl -s "$SERVER_URL/reset" > /dev/null
echo "Stats reset." | tee -a "$LOG_FILE"

# Function to run stress test for an endpoint
run_stress_test() {
  local endpoint=$1

  echo "" | tee -a "$LOG_FILE"
  echo "Benchmarking $endpoint for $ROUNDS rounds..." | tee -a "$LOG_FILE"

  for round in $(seq 1 $ROUNDS); do
    echo "" | tee -a "$LOG_FILE"
    echo "[$endpoint] Round $round..." | tee -a "$LOG_FILE"
    autocannon -c $CONNECTIONS -d $DURATION -p $PIPELINE "$SERVER_URL/$endpoint" | tee -a "$LOG_FILE"
  done
}

# Benchmark /sync
run_stress_test "sync"

# Benchmark /async
run_stress_test "async"

# Fetch stats
echo "" | tee -a "$LOG_FILE"
echo "Fetching /stats..." | tee -a "$LOG_FILE"
curl -s "$SERVER_URL/stats" | tee "$RESULT_FILE" | tee -a "$LOG_FILE"

echo ""
echo "Benchmark complete."
echo "Stats saved to:     $RESULT_FILE"
echo "Log saved to:       $LOG_FILE"
