#!/bin/zsh

export TZ="Asia/Kolkata"

_DATE=$(date "+%a %b %d %Y %I:%M %p")
DATE_DAY=$(echo $_DATE | awk '{print $1}')
DATE_MONTH=$(echo $_DATE | awk '{print $2}')
DATE_DAY_NUM=$(echo $_DATE | awk '{print $3}')
DATE_YEAR=$(echo $_DATE | awk '{print $4}')
DATE_TIME=$(echo $_DATE | awk '{print $5}')
DATE_AMPM=$(echo $_DATE | awk '{print $6}')

# Get Wi-Fi SSID using networksetup
WIFI_SSID=$(networksetup -getairportnetwork en0 2>/dev/null | sed 's/Current Wi-Fi Network: //')
if [ -z "$WIFI_SSID" ] || echo "$WIFI_SSID" | grep -q "not associated"; then
  WIFI_SSID="N/A"
fi

# Get Wi-Fi speed in Mbps (approximate based on network rate)
WIFI_RATE=$(networksetup -getinfo "Wi-Fi" 2>/dev/null | grep "IP address" | awk '{print $3}')
if [ -z "$WIFI_RATE" ]; then
  WIFI_RATE="N/A"
else
  WIFI_RATE="WiFi"
fi

# Get CPU usage - whole number
CPU_OUTPUT=$(top -l 1 -n 0)
CPU_IDLE=$(echo "$CPU_OUTPUT" | grep "CPU usage" | awk '{print $NF}' | tr -d '%')
if [ -z "$CPU_IDLE" ]; then
  CPU_IDLE="0"
fi
CPU_USAGE=$((100 - ${CPU_IDLE%.*}))
if [ "$CPU_USAGE" -lt 0 ] || [ "$CPU_USAGE" -gt 100 ]; then
  CPU_USAGE=0
fi

# Get memory using sysctl for total and vm_stat for used
MAX_MEMORY=$(sysctl -n hw.memsize)
PAGE_SIZE=$(vm_stat | head -1 | awk '{print $8}')

ACTIVE=$(vm_stat | grep "Pages active:" | awk '{print $3}' | tr -d '.')
WIRED=$(vm_stat | grep "Pages wired down:" | awk '{print $4}' | tr -d '.')
PURGEABLE=$(vm_stat | grep "Pages purgeable:" | awk '{print $3}' | tr -d '.')

[ -z "$ACTIVE" ] && ACTIVE=0
[ -z "$WIRED" ] && WIRED=0
[ -z "$PURGEABLE" ] && PURGEABLE=0

MEM_USED=$((ACTIVE + WIRED + PURGEABLE))
if [ "$MAX_MEMORY" -gt 0 ] && [ "$PAGE_SIZE" -gt 0 ]; then
  MEM_USAGE=$(echo "scale=2; $MEM_USED * $PAGE_SIZE * 100 / $MAX_MEMORY" | bc 2>/dev/null)
  MEM_USAGE=$(printf "%.0f" "$MEM_USAGE" 2>/dev/null || echo "0")
else
  MEM_USAGE="0"
fi

# Get disk usage using df
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | tr -d '%')
[ -z "$DISK_USAGE" ] && DISK_USAGE="N/A"

# Get aerospace workspace
AEROSPACE_WORKSPACE=$(/opt/homebrew/bin/aerospace list-workspaces --focused 2>/dev/null)
if [ -z "$AEROSPACE_WORKSPACE" ]; then
  AEROSPACE_WORKSPACE="N/A"
fi

# Get running apps in current workspace (max 4)
RUNNING_APPS=$(/opt/homebrew/bin/aerospace list-windows --focused 2>/dev/null | awk -F'|' 'NR>0 && $2 != "" {print $2}' | head -4 | tr '\n' ',' | sed 's/,$//')
if [ -z "$RUNNING_APPS" ]; then
  RUNNING_APPS="N/A"
fi

printf '{"date_day":"%s","date_month":"%s","date_day_num":"%s","date_year":"%s","date_time":"%s","date_ampm":"%s","ssid":"%s","wifi_speed":"%s","cpu_usage":"%s","mem_usage":"%s","disk_usage":"%s","workspace":"%s","running_apps":"%s"}' \
  "$DATE_DAY" "$DATE_MONTH" "$DATE_DAY_NUM" "$DATE_YEAR" "$DATE_TIME" "$DATE_AMPM" \
  "$WIFI_SSID" "$WIFI_RATE" "$CPU_USAGE" "$MEM_USAGE" "$DISK_USAGE" "$AEROSPACE_WORKSPACE" "$RUNNING_APPS"