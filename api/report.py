from http.server import BaseHTTPRequestHandler
import json, os
from urllib.parse import urlparse, parse_qs
from supabase import create_client

supabase = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        report_id = query.get("id", [None])[0]

        if not report_id:
            self._respond(400, {"error": "Report id is required"})
            return

        try:
            resp = supabase.table("reports").select("*").eq("id", report_id).execute()
        except Exception as e:
            self._respond(500, {"error": str(e)})
            return

        if resp.data:
            self._respond(200, resp.data[0]["report_data"])
        else:
            self._respond(404, {"error": "Report not found"})

    def _respond(self, status, payload):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode())