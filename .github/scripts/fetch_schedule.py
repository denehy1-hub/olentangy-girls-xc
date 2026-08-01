import csv
import json
import urllib.request
import os
from datetime import datetime

SHEET_ID = "1LV2fQMbzmrn6rvsrRhM33DyDH_ox0FF79s4mP9-SKUs"
CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTdl0DfPH_EVGwxqTB7t-XB4HNi1GOwUV-KUXbmUAXzbRr_HLHswxlnPhLFpVyfdr6IE3SLU5ZfcO4w/pub?output=csv"
OUTPUT_DIR = "assets/data"
JSON_FILE = f"{OUTPUT_DIR}/schedule.json"
ICS_FILE = f"{OUTPUT_DIR}/schedule.ics"

def generate_ics(events):
    ics_lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Olentangy Girls XC//Schedule Sync//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH"
    ]
    
    for event in events:
        try:
            dt = datetime.strptime(event["date"].strip(), "%B %d, %Y")
            date_str = dt.strftime("%Y%m%d")
            
            ics_lines.extend([
                "BEGIN:VEVENT",
                f"SUMMARY:{event['eventName']}",
                f"LOCATION:{event['location']}",
                f"DESCRIPTION:Category: {event['category']}",
                f"DTSTART;VALUE=DATE:{date_str}",
                f"DTEND;VALUE=DATE:{date_str}",
                "END:VEVENT"
            ])
        except Exception as e:
            print(f"Skipping ICS for event due to date format: {event['eventName']} ({e})")
            
    ics_lines.append("END:VCALENDAR")
    return "\r\n".join(ics_lines)

def fetch_and_convert():
    print("Fetching data from Google Sheets...")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    try:
        req = urllib.request.Request(
            CSV_URL,
            headers={'User-Agent': 'Mozilla/5.0'}
        )
        
        with urllib.request.urlopen(req) as response:
            content = response.read().decode('utf-8-sig')
            
        if "<html" in content.lower():
            raise RuntimeError("Google Sheets returned an HTML login page instead of CSV data.")
            
        lines = content.splitlines()
        print(f"Total lines fetched: {len(lines)}")
        
        reader = csv.DictReader(lines)
        print(f"Raw Detected Headers: {reader.fieldnames}")
        
        schedule_data = []
        for row in reader:
            # Normalize all keys: lowercase and strip all spaces/special characters
            normalized_row = {}
            for k, v in row.items():
                if k:
                    norm_key = "".join(char for char in str(k).lower() if char.isalnum())
                    normalized_row[norm_key] = str(v).strip() if v else ""
            
            # Map against normalized keys (e.g., "eventname", "category", "location", "date", "address")
            category = normalized_row.get("category", "")
            event_name = normalized_row.get("eventname", "")
            location = normalized_row.get("location", "")
            date = normalized_row.get("date", "")
            address = normalized_row.get("address", "")
            
            full_location = f"{location} - {address}" if address and location else (location or address)
            
            if event_name:
                schedule_data.append({
                    "category": category,
                    "eventName": event_name,
                    "location": full_location,
                    "date": date
                })
                
        print(f"Total successfully parsed events: {len(schedule_data)}")
        
        if len(schedule_data) == 0:
            raise ValueError("Parsed 0 events! Check your Google Sheet content and ensure rows are filled.")
        
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            json.dump(schedule_data, f, indent=4)
            
        ics_content = generate_ics(schedule_data)
        with open(ICS_FILE, 'w', encoding='utf-8') as f:
            f.write(ics_content)
            
        print("Successfully generated schedule.json and schedule.ics")
            
    except Exception as e:
        print(f"Error in pipeline: {e}")
        exit(1)

if __name__ == "__main__":
    fetch_and_convert()