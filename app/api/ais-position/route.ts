// VesselFinder AIS position proxy for Unicorn Chaser (MMSI: 232067012)
// Fetches data from VesselFinder public detail pages.
// Returns JSON: { latitude, longitude, sog, cog, timestamp }

const MMSI = "232067012";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    // Try VesselFinder's JSON data API
    const data = await fetchFromVesselFinder();
    if (data) {
      return new Response(
        JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: "vesselfinder",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
          },
        }
      );
    }

    // Fallback: try public AIS Hub
    const data2 = await fetchFromAISHub();
    if (data2) {
      return new Response(
        JSON.stringify({
          ...data2,
          timestamp: new Date().toISOString(),
          source: "aishub",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "No position data available" }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("AIS API error:", error instanceof Error ? error.message : String(error));
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to fetch AIS data" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

async function fetchFromVesselFinder(): Promise<{
  latitude: number;
  longitude: number;
  sog: number;
  cog: number;
} | null> {
  try {
    const res = await fetch(
      `https://www.vesselfinder.com/vessels/details/${MMSI}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) {
      console.error("VesselFinder HTTP error:", res.status);
      return null;
    }

    const html = await res.text();

    // Extract the data-json from the djson div
    const jsonMatch = html.match(
      /<div id="djson" data-json='({[^']+})'>/
    );
    if (!jsonMatch) {
      console.error("VesselFinder: no djson found");
      return null;
    }

    const parsed = JSON.parse(jsonMatch[1].replace(/&quot;/g, '"'));

    if (parsed.ship_lat !== undefined && parsed.ship_lon !== undefined) {
      return {
        latitude: parsed.ship_lat,
        longitude: parsed.ship_lon,
        sog: parsed.ship_sog || 0,
        cog: parsed.ship_cog || 0,
      };
    }

    return null;
  } catch (error: unknown) {
    console.error("VesselFinder fetch error:", error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function fetchFromAISHub(): Promise<{
  latitude: number;
  longitude: number;
  sog: number;
  cog: number;
} | null> {
  // AIS Hub free tier: https://www.aishub.net/api
  // Requires a free API key. Check if env var is set.
  const apiKey = process.env.AISHUB_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://www.aishub.net/api/station/position?format=1&username=${apiKey}&mmsi=${MMSI}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;

    const text = await res.text();
    const lines = text.trim().split("\n");
    if (lines.length < 2) return null;

    // Format: TIMESTAMP,MMSI,LAT,LON,COG,SOG,HEADING,NAVSTAT,IMO,NAME,CALLSIGN,TYPE,A,B,C,D,DRAUGHT,DEST,ETA,SOURCE,INTRNL
    const cols = lines[1].split(",");
    if (cols.length < 6) return null;

    return {
      latitude: parseFloat(cols[2]) || 0,
      longitude: parseFloat(cols[3]) || 0,
      sog: parseFloat(cols[5]) || 0,
      cog: parseFloat(cols[4]) || 0,
    };
  } catch {
    return null;
  }
}
