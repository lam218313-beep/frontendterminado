echo "========================================"
echo "Pixely Partners - Orchestrator Starting"
echo "========================================"
echo "[Startup] Waiting for API to be ready..."
sleep 10
echo "[Startup] Running initial analysis..."
cd /app
if python -m orchestrator; then
    echo "[Startup] ✅ Initial analysis completed successfully"
else
    echo "[Warning] ⚠️ Initial analysis failed (API may still be starting)"
    echo "[Info] Scheduled runs will retry automatically at 6:00 AM daily"
fi
echo "[Startup] Starting cron daemon for scheduled runs (6:00 AM daily)"
