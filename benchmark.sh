#!/bin/bash

# Configuration
SERVER_URL="http://localhost:3000"
DURATION=10
CONNECTIONS=100
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
RESULTS_DIR="results"
RESULT_FILE="$RESULTS_DIR/benchmark_$TIMESTAMP.json"
LOG_FILE="$RESULTS_DIR/benchmark_$TIMESTAMP.log"

# Create results directory if not exists
mkdir -p "$RESULTS_DIR"

# Reset stats
echo "Resetting stats..."
curl -s "$SERVER_URL/reset" > /dev/null
echo "Stats reset." | tee "$LOG_FILE"

# Benchmark sync
echo "" | tee -a "$LOG_FILE"
echo "Benchmarking /sync..." | tee -a "$LOG_FILE"
autocannon -c $CONNECTIONS -d $DURATION "$SERVER_URL/sync" | tee -a "$LOG_FILE"

# Benchmark async
echo "" | tee -a "$LOG_FILE"
echo "Benchmarking /async..." | tee -a "$LOG_FILE"
autocannon -c $CONNECTIONS -d $DURATION "$SERVER_URL/async" | tee -a "$LOG_FILE"

# Fetch stats
echo "" | tee -a "$LOG_FILE"
echo "Fetching /stats..." | tee -a "$LOG_FILE"
curl -s "$SERVER_URL/stats" | tee "$RESULT_FILE" | tee -a "$LOG_FILE"

echo ""
echo "Benchmark complete."
echo "Stats saved to:     $RESULT_FILE"
echo "Log saved to:       $LOG_FILE"
