import json
import re
import os

# Files
COMPANY_FILE = 'linked_company_details.json'
TIMELINE_FILE = 'linked_timeline.json'
OUTPUT_FILE = 'merged_company_data.json'

def merge_company_data():
    # 1. Validate files exist
    for file in [COMPANY_FILE, TIMELINE_FILE]:
        if not os.path.exists(file):
            print(f"Error: {file} not found")
            return

    # 2. Load Data
    with open(COMPANY_FILE, 'r', encoding='utf-8') as f:
        company_details = json.load(f)
    with open(TIMELINE_FILE, 'r', encoding='utf-8') as f:
        timeline_data = json.load(f)
        
    print(f"Processing {len(company_details)} roles and {len(timeline_data)} events...")

    # 3. Build company index map
    company_map = {}  # name -> list of indices
    for idx, entry in enumerate(company_details):
        name = entry.get('company_name', '').strip()
        if name:
            company_map.setdefault(name, []).append(idx)
            entry.setdefault('timeline_events', [])

    # 4. Pre-compile regex patterns (performance optimization)
    patterns = {
        name: re.compile(r'(?<!\w)' + re.escape(name) + r'(?!\w)', re.IGNORECASE)
        for name in company_map.keys()
    }
    
    # Sort by length descending (longer names first = better matching)
    sorted_names = sorted(company_map.keys(), key=len, reverse=True)

    # 5. Process Timeline Events
    matched_count = 0
    
    for event in timeline_data:
        title = event.get('title', '').strip()
        if not title:
            continue
            
        # Find all matching company names
        mentions = [name for name in sorted_names if patterns[name].search(title)]
        
        # Filter out substrings (keep "Google Cloud", drop "Google")
        final_matches = [
            m for m in mentions
            if not any(m.lower() in other.lower() and m != other for other in mentions)
        ]
        
        if not final_matches:
            continue
            
        matched_count += 1
        event_obj = {
            "title": event.get('title'),
            "description": event.get('description'),
            "created_at": event.get('CreatedAt'),
            "id": event.get('ID'),
            "tags": event.get('tags', '')
        }
        
        # Attach to all matching company profiles
        for company_name in final_matches:
            for idx in company_map[company_name]:
                company_details[idx]['timeline_events'].append(event_obj)

    # 6. Save
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(company_details, f, indent=4, ensure_ascii=False)
        
    print(f"✓ Merged {matched_count} timeline events")
    print(f"✓ Saved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    merge_company_data()