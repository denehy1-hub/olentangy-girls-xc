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
        req = urllib.request.Request(
            CSV_URL,
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        response = urllib.request.urlopen(req)
        content = response.read().decode('utf-8')
        
        lines = content.splitlines()
        reader = csv.DictReader(lines)
        print(f"Detected Headers: {reader.fieldnames}")
        
        schedule_data = []
        for row in reader:
            # Clean keys by stripping spaces and lowercasing
            clean_row = {k.strip().lower(): (v.strip() if v else "") for k, v in row.items() if k}
            
            category = clean_row.get("category", "")
            # Look for 'eventname' (matching your column) as well as fallbacks
            event_name = clean_row.get("eventname", "") or clean_row.get("event name", "") or clean_row.get("event", "")
            location = clean_row.get("location", "") or clean_row.get("location / details", "")
            date = clean_row.get("date", "")
            
            if event_name:
                schedule_data.append({
                    "category": category,
                    "eventName": event_name,
                    "location": location,
                    "date": date
                })
                
        print(f"Total parsed events: {len(schedule_data)}")
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(schedule_data, f, indent=4)
            
    except Exception as e:
        print(f"Error in pipeline: {e}")
        exit(1)

if __name__ == "__main__":
    fetch_and_convert()