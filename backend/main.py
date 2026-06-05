from fastapi import FastAPI, UploadFile, File
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import re
import os
import requests
from typing import List, Dict
from dotenv import load_dotenv
from datetime import datetime
from geopy.distance import geodesic
import math
from pymongo import MongoClient
from bson import ObjectId

load_dotenv()

app = FastAPI(title="IP Intelligence Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load API keys
IPINFO_TOKEN = os.getenv("IPINFO_TOKEN")
ABUSEIPDB_KEY = os.getenv("ABUSEIPDB_KEY")
MONGODB_URI = os.getenv("MONGODB_URI")

# Connect to MongoDB
try:
    mongo_client = MongoClient(MONGODB_URI)
    db = mongo_client["ip_tracker"]
    cases_collection = db["cases"]
    ip_cache_collection = db["ip_cache"]
    mongo_client.server_info()
    print("[OK] MongoDB connected")
except Exception as e:
    print(f"[ERROR] MongoDB failed: {str(e)}")
    cases_collection = None
    ip_cache_collection = None

# Keyword lists for threat scoring
HOSTING_KEYWORDS = [
    "hosting", "server", "cloud", "datacenter", "data center",
    "ovh", "digitalocean", "amazon", "aws", "azure", "google cloud",
    "linode", "vultr", "hetzner", "contabo"
]

VPN_KEYWORDS = [
    "vpn", "proxy", "tor", "anonymous", "privacy",
    "hide", "tunnel", "mullvad", "nordvpn", "expressvpn"
]


def extract_ips_with_timestamps(text: str) -> List[Dict]:
    """Extract IPs with timestamps from multiple log formats."""
    timeline = []
    lines = text.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
        
        ip_match = re.search(r'\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b', line)
        if not ip_match:
            continue
        
        ip = ip_match.group()
        timestamp = None
        
        # Standard: 2024-01-15 10:00:00
        ts_match = re.search(r'(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})', line)
        if ts_match:
            timestamp = ts_match.group(1)
        
        # Apache/Nginx: [15/Jan/2024:10:00:00 +0000]
        if not timestamp:
            ts_match = re.search(r'\[(\d{2})/(\w{3})/(\d{4}):(\d{2}:\d{2}:\d{2})', line)
            if ts_match:
                months = {'Jan':'01','Feb':'02','Mar':'03','Apr':'04','May':'05','Jun':'06',
                          'Jul':'07','Aug':'08','Sep':'09','Oct':'10','Nov':'11','Dec':'12'}
                month = months.get(ts_match.group(2), '01')
                timestamp = f"{ts_match.group(3)}-{month}-{ts_match.group(1)} {ts_match.group(4)}"
        
        # Syslog: Jan 15 10:00:00
        if not timestamp:
            ts_match = re.search(r'(\w{3})\s+(\d{1,2})\s+(\d{2}:\d{2}:\d{2})', line)
            if ts_match:
                months = {'Jan':'01','Feb':'02','Mar':'03','Apr':'04','May':'05','Jun':'06',
                          'Jul':'07','Aug':'08','Sep':'09','Oct':'10','Nov':'11','Dec':'12'}
                month = months.get(ts_match.group(1), '01')
                day = ts_match.group(2).zfill(2)
                year = datetime.now().strftime('%Y')
                timestamp = f"{year}-{month}-{day} {ts_match.group(3)}"
        
        # ISO: 2024-01-15T10:00:00Z
        if not timestamp:
            ts_match = re.search(r'(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})', line)
            if ts_match:
                timestamp = f"{ts_match.group(1)} {ts_match.group(2)}"
        
        if timestamp and ip:
            timeline.append({"timestamp": timestamp, "ip": ip})
    
    return timeline


def get_ip_info(ip: str) -> dict:
    """Get geolocation data for an IP, with MongoDB caching."""
    try:
        if ip.startswith(("192.168.", "10.", "172.16.", "127.")):
            return {"city":"Private","region":"Local","country":"Local","loc":None,"org":"Private IP","timezone":None}
        
        if ip_cache_collection is not None:
            cached = ip_cache_collection.find_one({"ip": ip})
            if cached:
                return cached.get("data", {})
        
        url = f"https://ipinfo.io/{ip}/json?token={IPINFO_TOKEN}"
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if ip_cache_collection is not None:
                ip_cache_collection.update_one({"ip": ip}, {"$set": {"ip": ip, "data": data}}, upsert=True)
            return data
        return {"error": f"API error {response.status_code}"}
    except Exception as e:
        return {"error": str(e)}


def check_abuse_ipdb(ip: str) -> dict:
    """Check IP reputation against AbuseIPDB."""
    default = {"abuse_score": 0, "total_reports": 0, "last_reported": None, "is_whitelisted": False}
    try:
        if ip.startswith(("192.168.", "10.", "172.16.", "127.")):
            return default
        
        headers = {"Accept": "application/json", "Key": ABUSEIPDB_KEY}
        params = {"ipAddress": ip, "maxAgeInDays": 90}
        response = requests.get("https://api.abuseipdb.com/api/v2/check", headers=headers, params=params, timeout=10)
        
        if response.status_code == 200:
            result = response.json()["data"]
            return {
                "abuse_score": result.get("abuseConfidenceScore", 0),
                "total_reports": result.get("totalReports", 0),
                "last_reported": result.get("lastReportedAt"),
                "is_whitelisted": result.get("isWhitelisted", False)
            }
        return default
    except Exception:
        return default


def calculate_threat_score(ip_data, alerts):
    """Calculate threat score (0-100) for an IP."""
    score = 0
    reasons = []
    org = (ip_data.get("org") or "").lower()
    ip = ip_data.get("ip", "")
    
    for keyword in VPN_KEYWORDS:
        if keyword in org:
            score += 30
            reasons.append("VPN/Proxy detected")
            break
    
    for keyword in HOSTING_KEYWORDS:
        if keyword in org:
            score += 15
            reasons.append("Hosting/Datacenter IP")
            break
    
    for alert in alerts:
        if alert["type"] == "IMPOSSIBLE_TRAVEL":
            if ip == alert.get("from_ip") or ip == alert.get("to_ip"):
                score += 25
                reasons.append("Involved in impossible travel")
                break
    
    for alert in alerts:
        if alert["type"] == "RAPID_IP_SWITCH":
            if ip == alert.get("from_ip") or ip == alert.get("to_ip"):
                score += 20
                reasons.append("Rapid IP switching")
                break
    
    abuse_score = ip_data.get("abuse_score", 0)
    abuse_reports = ip_data.get("abuse_reports", 0)
    if abuse_score > 50:
        score += 30
        reasons.append(f"AbuseIPDB score: {abuse_score}%")
    if abuse_reports > 10:
        score += 15
        reasons.append(f"Reported {abuse_reports} times")
    
    score = min(score, 100)
    level = "MALICIOUS" if score >= 71 else "SUSPICIOUS" if score >= 31 else "CLEAN"
    
    return {"score": score, "level": level, "reasons": reasons}


def detect_patterns(timeline: List[Dict]) -> List[Dict]:
    """Detect impossible travel, VPN usage, and rapid IP switching."""
    alerts = []
    
    for i in range(1, len(timeline)):
        current = timeline[i]
        previous = timeline[i - 1]
        
        if not current.get("loc") or not previous.get("loc"):
            continue
        
        current_coords = tuple(map(float, current["loc"].split(",")))
        previous_coords = tuple(map(float, previous["loc"].split(",")))
        distance_km = geodesic(previous_coords, current_coords).kilometers
        
        time_format = "%Y-%m-%d %H:%M:%S"
        current_time = datetime.strptime(current["timestamp"], time_format)
        previous_time = datetime.strptime(previous["timestamp"], time_format)
        time_diff_minutes = max((current_time - previous_time).total_seconds() / 60, 0.01)
        
        required_speed = distance_km / (time_diff_minutes / 60)
        
        if required_speed > 900 and distance_km > 100:
            alerts.append({
                "type": "IMPOSSIBLE_TRAVEL", "severity": "HIGH",
                "from_ip": previous["ip"], "to_ip": current["ip"],
                "from_location": f"{previous.get('city','Unknown')}, {previous.get('country','Unknown')}",
                "to_location": f"{current.get('city','Unknown')}, {current.get('country','Unknown')}",
                "distance_km": round(distance_km, 2),
                "time_minutes": round(time_diff_minutes, 2),
                "required_speed_kmh": round(required_speed, 2),
                "message": f"Impossible to travel {round(distance_km)}km in {round(time_diff_minutes)} minutes"
            })
        
        org = current.get("org", "").lower()
        if any(k in org for k in ["vpn","proxy","tor","anonymous","privacy"]):
            alerts.append({
                "type": "VPN_DETECTED", "severity": "MEDIUM",
                "ip": current["ip"], "organization": current.get("org"),
                "message": f"Possible VPN/Proxy usage detected: {current.get('org')}"
            })
        
        if time_diff_minutes < 5 and current["ip"] != previous["ip"]:
            alerts.append({
                "type": "RAPID_IP_SWITCH", "severity": "MEDIUM",
                "from_ip": previous["ip"], "to_ip": current["ip"],
                "time_minutes": round(time_diff_minutes, 2),
                "message": f"IP changed from {previous['ip']} to {current['ip']} in {round(time_diff_minutes, 2)} minutes"
            })
    
    return alerts


# ============================================
# API ENDPOINTS
# ============================================

@app.get("/")
def read_root():
    return {"message": "IP Intelligence Tracker API", "status": "running"}


@app.post("/analyze")
async def analyze_log(file: UploadFile = File(...)):
    """Upload a log file and get full analysis."""
    try:
        contents = await file.read()
        text = contents.decode('utf-8')
        
        timeline = extract_ips_with_timestamps(text)
        if not timeline:
            return {"error": "No IPs with timestamps found", "hint": "Format: YYYY-MM-DD HH:MM:SS ... IP"}
        
        enriched_timeline = []
        for entry in timeline:
            ip = entry["ip"]
            info = get_ip_info(ip)
            abuse = check_abuse_ipdb(ip)
            enriched_timeline.append({
                "timestamp": entry["timestamp"], "ip": ip,
                "city": info.get("city","Unknown"), "region": info.get("region","Unknown"),
                "country": info.get("country","Unknown"), "loc": info.get("loc"),
                "org": info.get("org","Unknown"), "timezone": info.get("timezone","Unknown"),
                "abuse_score": abuse["abuse_score"], "abuse_reports": abuse["total_reports"],
                "last_reported": abuse["last_reported"]
            })
        
        alerts = detect_patterns(enriched_timeline)
        
        for entry in enriched_timeline:
            threat = calculate_threat_score(entry, alerts)
            entry["threat_score"] = threat["score"]
            entry["threat_level"] = threat["level"]
            entry["threat_reasons"] = threat["reasons"]
        
        case_id = None
        if cases_collection is not None:
            case_data = {
                "filename": file.filename,
                "total_events": len(timeline),
                "unique_ips": len(set(e["ip"] for e in timeline)),
                "timeline": enriched_timeline,
                "alerts": alerts,
                "summary": {
                    "total_alerts": len(alerts),
                    "impossible_travel": len([a for a in alerts if a["type"] == "IMPOSSIBLE_TRAVEL"]),
                    "vpn_detected": len([a for a in alerts if a["type"] == "VPN_DETECTED"]),
                    "rapid_switches": len([a for a in alerts if a["type"] == "RAPID_IP_SWITCH"])
                },
                "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            result = cases_collection.insert_one(case_data)
            case_id = str(result.inserted_id)
        
        return {
            "filename": file.filename, "case_id": case_id,
            "total_events": len(timeline),
            "unique_ips": len(set(e["ip"] for e in timeline)),
            "timeline": enriched_timeline, "alerts": alerts,
            "summary": {
                "total_alerts": len(alerts),
                "impossible_travel": len([a for a in alerts if a["type"] == "IMPOSSIBLE_TRAVEL"]),
                "vpn_detected": len([a for a in alerts if a["type"] == "VPN_DETECTED"]),
                "rapid_switches": len([a for a in alerts if a["type"] == "RAPID_IP_SWITCH"])
            }
        }
    except Exception as e:
        return {"error": str(e)}


@app.get("/cases")
def get_all_cases():
    """Get list of all past investigations."""
    if cases_collection is None:
        return {"error": "Database not connected"}
    
    cases = []
    for case in cases_collection.find().sort("created_at", -1):
        cases.append({
            "case_id": str(case["_id"]),
            "filename": case.get("filename"),
            "total_events": case.get("total_events"),
            "unique_ips": case.get("unique_ips"),
            "total_alerts": case.get("summary", {}).get("total_alerts", 0),
            "created_at": case.get("created_at")
        })
    return {"total_cases": len(cases), "cases": cases}


@app.get("/cases/{case_id}")
def get_case(case_id: str):
    """Get full details of a specific investigation."""
    if cases_collection is None:
        return {"error": "Database not connected"}
    try:
        case = cases_collection.find_one({"_id": ObjectId(case_id)})
        if not case:
            return {"error": "Case not found"}
        case["_id"] = str(case["_id"])
        return case
    except Exception as e:
        return {"error": str(e)}


@app.get("/report/{case_id}")
def generate_report(case_id: str):
    """Generate a PDF report for an investigation."""
    from fpdf import FPDF
    
    if cases_collection is None:
        return {"error": "Database not connected"}
    
    try:
        case = cases_collection.find_one({"_id": ObjectId(case_id)})
        if not case:
            return {"error": "Case not found"}
        
        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()
        
        # Title
        pdf.set_font("Helvetica", "B", 24)
        pdf.set_text_color(0, 150, 255)
        pdf.cell(0, 20, "IP Intelligence Report", new_x="LMARGIN", new_y="NEXT", align="C")
        pdf.set_draw_color(0, 150, 255)
        pdf.line(10, pdf.get_y(), 200, pdf.get_y())
        pdf.ln(10)
        
        # Report info
        pdf.set_font("Helvetica", "", 11)
        pdf.set_text_color(80, 80, 80)
        pdf.cell(0, 8, f"File: {case.get('filename','Unknown')}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 8, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 8, f"Case ID: {str(case['_id'])}", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(10)
        
        # Summary
        pdf.set_fill_color(240, 240, 250)
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(0, 0, 0)
        pdf.cell(0, 10, "  Summary", new_x="LMARGIN", new_y="NEXT", fill=True)
        pdf.ln(5)
        
        summary = case.get("summary", {})
        pdf.set_font("Helvetica", "", 12)
        pdf.cell(0, 8, f"  Total Events: {case.get('total_events', 0)}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 8, f"  Unique IPs: {case.get('unique_ips', 0)}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 8, f"  Total Alerts: {summary.get('total_alerts', 0)}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 8, f"  Impossible Travel: {summary.get('impossible_travel', 0)}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 8, f"  VPN Detected: {summary.get('vpn_detected', 0)}", new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 8, f"  Rapid Switches: {summary.get('rapid_switches', 0)}", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(10)
        
        # IP Table
        pdf.set_fill_color(0, 100, 200)
        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 10)
        pdf.cell(8, 8, "#", border=1, fill=True, align="C")
        pdf.cell(35, 8, "IP Address", border=1, fill=True, align="C")
        pdf.cell(30, 8, "City", border=1, fill=True, align="C")
        pdf.cell(20, 8, "Country", border=1, fill=True, align="C")
        pdf.cell(15, 8, "Score", border=1, fill=True, align="C")
        pdf.cell(25, 8, "Level", border=1, fill=True, align="C")
        pdf.cell(57, 8, "ISP", border=1, fill=True, align="C")
        pdf.ln()
        
        pdf.set_font("Helvetica", "", 9)
        pdf.set_text_color(0, 0, 0)
        for i, entry in enumerate(case.get("timeline", [])):
            pdf.set_fill_color(245, 245, 255) if i % 2 == 0 else pdf.set_fill_color(255, 255, 255)
            pdf.cell(8, 7, str(i+1), border=1, fill=True, align="C")
            pdf.cell(35, 7, str(entry.get("ip","")), border=1, fill=True)
            pdf.cell(30, 7, str(entry.get("city",""))[:15], border=1, fill=True)
            pdf.cell(20, 7, str(entry.get("country","")), border=1, fill=True, align="C")
            pdf.cell(15, 7, str(entry.get("threat_score",0)), border=1, fill=True, align="C")
            pdf.cell(25, 7, entry.get("threat_level","CLEAN"), border=1, fill=True, align="C")
            pdf.cell(57, 7, str(entry.get("org",""))[:30], border=1, fill=True)
            pdf.ln()
        
        pdf.ln(10)
        
        # Alerts
        pdf.set_fill_color(255, 220, 220)
        pdf.set_font("Helvetica", "B", 14)
        pdf.set_text_color(200, 0, 0)
        pdf.cell(0, 10, "  Alerts", new_x="LMARGIN", new_y="NEXT", fill=True)
        pdf.ln(5)
        
        for alert in case.get("alerts", []):
            severity = alert.get("severity", "MEDIUM")
            pdf.set_text_color(200, 0, 0) if severity == "HIGH" else pdf.set_text_color(200, 150, 0)
            pdf.set_font("Helvetica", "B", 10)
            pdf.cell(0, 7, f"  [{severity}] {alert.get('type','')}", new_x="LMARGIN", new_y="NEXT")
            pdf.set_font("Helvetica", "", 9)
            pdf.set_text_color(80, 80, 80)
            pdf.cell(0, 6, f"    {alert.get('message','')}", new_x="LMARGIN", new_y="NEXT")
            pdf.ln(3)
        
        # Footer
        pdf.ln(20)
        pdf.set_font("Helvetica", "I", 8)
        pdf.set_text_color(150, 150, 150)
        pdf.cell(0, 5, "Generated by IP Intelligence Tracker | Confidential", align="C")
        
        report_path = f"report_{case_id}.pdf"
        pdf.output(report_path)
        
        return FileResponse(report_path, media_type="application/pdf",
                          filename=f"IP_Report_{case.get('filename','unknown')}.pdf")
    except Exception as e:
        return {"error": str(e)}


@app.get("/health")
def health_check():
    return {"status": "healthy"}