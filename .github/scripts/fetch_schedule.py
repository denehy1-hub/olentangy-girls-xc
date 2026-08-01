import csv
import json
import urllib.request
import os

# Define endpoints and paths
SHEET_ID = "1LV2fQMbzmrn6rvsrRhM33DyDH_ox0FF79s4mP9-SKUs"
CSV_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv"
OUTPUT_DIR = "assets/data"
OUTPUT_FILE = f"{OUTPUT_DIR}/schedule.json"

def fetch_and_convert():
    print(f"Fetching data from Google Sheets...")
    
    # Ensure the output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    try:
        # Download the CSV data
        response = urllib.request.urlopen(CSV_URL)
        lines = [l.decode('utf-8') for l in response.readlines()]
        
        # Parse CSV
        reader = csv.DictReader(lines)
        schedule_data = []
        
        for row in reader:
            # Only append rows that actually have an Event Name
            if row.get("Event Name") and row["Event Name"].strip() != "":
                schedule_data.append({
                    "category": row.get("Category", "").strip(),
                    "eventName": row.get("Event Name", "").strip(),
                    "location": row.get("Location / Details", "").strip(),
                    "date": row.get("Date", "").strip()
                })
                
        # Write to JSON
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(schedule_data, f, indent=4)
            
        print(f"Successfully saved {len(schedule_data)} events to {OUTPUT_FILE}")
        
    except Exception as e:
        print(f"Error in pipeline: {e}")
        exit(1)

if __name__ == "__main__":
    fetch_and_convert()