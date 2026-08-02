import csv
import json
import urllib.request
from io import StringIO
import os

# 1. Define the Google Sheets CSV export URLs
URLS = {
    "schedule": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTdl0DfPH_EVGwxqTB7t-XB4HNi1GOwUV-KUXbmUAXzbRr_HLHswxlnPhLFpVyfdr6IE3SLU5ZfcO4w/pub?gid=0&single=true&output=csv",
    "parent_supporters": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTdl0DfPH_EVGwxqTB7t-XB4HNi1GOwUV-KUXbmUAXzbRr_HLHswxlnPhLFpVyfdr6IE3SLU5ZfcO4w/pub?gid=442985252&single=true&output=csv",
    "roster": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTdl0DfPH_EVGwxqTB7t-XB4HNi1GOwUV-KUXbmUAXzbRr_HLHswxlnPhLFpVyfdr6IE3SLU5ZfcO4w/pub?gid=426847761&single=true&output=csv",
    "results": "https://docs.google.com/spreadsheets/d/e/2PACX-1vTdl0DfPH_EVGwxqTB7t-XB4HNi1GOwUV-KUXbmUAXzbRr_HLHswxlnPhLFpVyfdr6IE3SLU5ZfcO4w/pub?gid=2003395755&single=true&output=csv"
}

# 2. Map the URLs to your local JSON file paths
OUTPUT_PATHS = {
    "schedule": "assets/data/schedule.json",
    "parent_supporters": "assets/data/board_members.json",
    "roster": "assets/data/roster.json",
    "results": "assets/data/results.json"
}

def fetch_and_convert(url, output_file):
    print(f"Fetching data for {output_file}...")
    try:
        # Fetch the CSV data over HTTPS
        response = urllib.request.urlopen(url)
        csv_data = response.read().decode('utf-8')

        # Parse CSV into a list of dictionaries
        reader = csv.DictReader(StringIO(csv_data))
        
        data = []
        for row in reader:
            # Clean up the keys: make them lowercase and remove trailing spaces
            # This ensures "Name " in the sheet becomes "name" in the JSON
            cleaned_row = {str(k).strip().lower(): str(v).strip() for k, v in row.items() if k}
            data.append(cleaned_row)

        # Ensure the destination directory exists
        os.makedirs(os.path.dirname(output_file), exist_ok=True)

        # Write the list of dictionaries to a JSON file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4)
        
        print(f"✅ Successfully updated {output_file}")
        
    except Exception as e:
        print(f"❌ Error processing {output_file}: {e}")

if __name__ == "__main__":
    # Loop through the URLs and execute the conversion
    for key in URLS:
        fetch_and_convert(URLS[key], OUTPUT_PATHS[key])