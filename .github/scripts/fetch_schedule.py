import csv
import json
import urllib.request
import os

SHEET_ID = "1LV2fQMbzmrn6rvsrRhM33DyDH_ox0FF79s4mP9-SKUs"
CSV_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv"
OUTPUT_DIR = "assets/data"
OUTPUT_FILE = f"{OUTPUT_DIR}/schedule.json"

def fetch_and_convert():
    print("Fetching data from Google Sheets...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    try:
        response = urllib.request.urlopen(CSV_URL)
        lines = [l.decode('utf-8') for l in response.readlines()]
        
        reader = csv.DictReader(lines)
        schedule_data = []
        
        for row in reader:
            # Clean keys by stripping spaces so minor typos don't break it
            clean_row = {k.strip().lower(): v.strip() for k, v in row.items() if k}
            
            # Look up fields flexibly
            category = clean_row.get("category", "")
            event_name = clean_row.get("event name", "") or clean_row.get("event", "")
            location = clean_row.get("location / details", "") or clean_row.get("location", "")
            date = clean_row.get("date", "")
            
            if event_name:
                schedule_data.append({
                    "category": category,
                    "eventName": event_name,
                    "location": location,
                    "date": date
                })
                
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(schedule_data, f, indent=4)
            
        print(f"Successfully saved {len(schedule_data)} events to {OUTPUT_FILE}")
        
    except Exception as e:
        print(f"Error in pipeline: {e}")
        exit(1)

if __name__ == "__main__":
    fetch_and_convert()