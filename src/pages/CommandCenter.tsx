import { ArrowUpRight, Camera, MapPinned, Radar, ShieldAlert, TriangleAlert, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SurveillanceVideo from "../components/SurveillanceVideo";
import CyberSecurityPanel from "../components/CyberSecurityPanel";
import { DEMO_CAMERAS } from "../services/demoData";
import { useCyberSecurity } from "../context/CyberSecurityContext";

const statCards = [
  { label: "LIVE CAMERAS", value: "18", suffix: "/24", tone: "cyan" },
  { label: "ACTIVE AI TRACKS", value: "127", tone: "blue" },
  { label: "ALERTS TODAY", value: "08", tone: "amber" },
  { label: "CRITICAL THREATS", value: "03", tone: "red" },
  { label: "SYSTEM UPTIME", value: "99.4", suffix: "%", tone: "green" },
  { label: "AVG CONFIDENCE", value: "94", suffix: "%", tone: "violet" },
];

const threatFeed = [
  { severity: "CRITICAL", title: "BORDER INTRUSION", sector: "SECTOR 04", camera: "CAM-07", confidence: 96, time: "19:42:18" },
  { severity: "HIGH", title: "UNAUTHORIZED VEHICLE", sector: "SECTOR 02", camera: "CAM-03", confidence: 89, time: "19:40:54" },
  { severity: "MEDIUM", title: "VIRTUAL FENCE WARNING", sector: "SECTOR 06", camera: "CAM-11", confidence: 74, time: "19:39:21" },
];

const cameraTiles = [
  { id: "CAM-01", location: "NORTH SECTOR", status: "LIVE", persons: 4, vehicles: 2, time: "19:42:18" },
  { id: "CAM-03", location: "WEST CHECKPOINT", status: "LIVE", persons: 1, vehicles: 5, time: "19:42:16" },
  { id: "CAM-07", location: "RIVER GATE", status: "ALERT", persons: 6, vehicles: 2, time: "19:42:14" },
  { id: "CAM-11", location: "RESTRICTED LINE", status: "LIVE", persons: 2, vehicles: 1, time: "19:42:10" },
];

const recentEvents = [
  { time: "19:42:18", detail: "Fence violation detected", location: "Sector 04" },
  { time: "19:41:52", detail: "Vehicle detected", location: "Sector 02" },
  { time: "19:40:31", detail: "Watchlist match", location: "Sector 07" },
  { time: "19:39:11", detail: "Crowd density rise", location: "Sector 11" },
];

export default function CommandCenter() {
  const nav = useNavigate();
  const { events, alerts } = useCyberSecurity();
  const mainCamera = DEMO_CAMERAS[0];
  const operationalEvents = events.length
    ? events.slice(0, 4).map((event) => ({
      time: new Date(event.timestamp).toLocaleTimeString(),
      detail: event.event_type,
      location: `${event.camera_id}${event.source_ip ? ` · ${event.source_ip}` : " · AI/PHYSICAL"}`,
    }))
    : recentEvents;

  return (
    <div className="command-page">
      <div className="command-header">
        <div>
          <div className="eyebrow">INTELLIGENT BORDER VIDEO ANALYTICS PLATFORM</div>
          <h1>COMMAND CENTER</h1>
        </div>
        <button type="button" className="primary-action" onClick={() => nav("/surveillance")}>
          <Radar size={14} />
          VIEW LIVE OPS
        </button>
      </div>

      <div className="stat-grid">
        {statCards.map((stat) => (
          <div key={stat.label} className={`stat-card tone-${stat.tone}`}>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">
              {stat.label === "ALERTS TODAY" ? String(Number(stat.value) + alerts.length).padStart(2, "0")
                : stat.label === "CRITICAL THREATS" ? String(Number(stat.value) + alerts.filter((alert) => alert.severity === "CRITICAL" && alert.status === "ACTIVE").length).padStart(2, "0")
                  : stat.value}
              {stat.suffix ? <span>{stat.suffix}</span> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="ops-grid">
        <section className="panel map-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <div className="panel-dot" />
              <span>LIVE BORDER OPERATIONS</span>
            </div>
            <button type="button" className="mini-link" onClick={() => nav("/map")}>
              OPEN MAP
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="map-surface">
            <div className="map-radial" />
            <div className="sector sector-a" />
            <div className="sector sector-b" />
            <div className="sector sector-c" />
            <div className="route route-a" />
            <div className="route route-b" />

            <div className="map-marker marker-cam cam-one"><Camera size={10} /> CAM-01</div>
            <div className="map-marker marker-cam cam-two"><Camera size={10} /> CAM-07</div>
            <div className="map-marker marker-cam cam-three"><Camera size={10} /> CAM-11</div>
            <div className="map-marker marker-threat threat-one"><ShieldAlert size={10} /> THREAT</div>
            <div className="map-marker marker-threat threat-two"><TriangleAlert size={10} /> ALERT</div>
            <div className="map-marker marker-fence fence-one" />
            <div className="map-marker marker-fence fence-two" />
          </div>
        </section>

        <aside className="panel intel-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <div className="panel-dot red" />
              <span>THREAT INTELLIGENCE</span>
            </div>
            <button type="button" className="mini-link" onClick={() => nav("/threat-intelligence")}>
              VIEW ALL
            </button>
          </div>

          <div className="intel-list">
            {threatFeed.map((threat) => (
              <div key={threat.camera} className="threat-item">
                <div className="threat-head">
                  <div className={`severity severity-${threat.severity.toLowerCase()}`}>{threat.severity}</div>
                  <span className="threat-time">{threat.time}</span>
                </div>
                <div className="threat-title">{threat.title}</div>
                <div className="threat-meta">
                  <span>{threat.sector}</span>
                  <span>{threat.camera}</span>
                </div>
                <div className="threat-foot">
                  <span>CONFIDENCE {threat.confidence}%</span>
                  <button type="button">INVESTIGATE</button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="lower-grid">
        <section className="panel camera-wall-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <div className="panel-dot cyan" />
              <span>LIVE CCTV GRID</span>
            </div>
            <button type="button" className="mini-link" onClick={() => nav("/surveillance")}>
              FULL SCREEN
            </button>
          </div>

          <div className="camera-grid">
            <div className="camera-tile feature-tile">
              <SurveillanceVideo camera={mainCamera} detections={[]} showPTZ={false} onFullscreen={() => nav("/surveillance")} />
            </div>
            {cameraTiles.slice(1).map((camera) => (
              <div key={camera.id} className="camera-tile compact-tile">
                <div className="camera-overlay" />
                <div className="camera-meta">
                  <div className="camera-header-row">
                    <span>{camera.id}</span>
                    <span className={`status-badge ${camera.status === "ALERT" ? "alert" : "live"}`}>{camera.status}</span>
                  </div>
                  <div className="camera-location">{camera.location}</div>
                  <div className="camera-stats">
                    <span>PERSONS: {camera.persons}</span>
                    <span>VEHICLES: {camera.vehicles}</span>
                  </div>
                  <div className="camera-time">{camera.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel feed-panel">
          <div className="panel-header">
            <div className="panel-title-wrap">
              <div className="panel-dot amber" />
              <span>OPERATIONAL FEED</span>
            </div>
          </div>

          <div className="event-list">
            {operationalEvents.map((event, index) => (
              <div key={`${event.time}-${event.detail}-${index}`} className="event-row">
                <div className="event-time">{event.time}</div>
                <div className="event-copy">
                  <div>{event.detail}</div>
                  <div className="event-location">{event.location}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="summary-panel">
            <div className="summary-topline">
              <Zap size={12} />
              <span>ACTIVE INCIDENTS</span>
            </div>
            <div className="summary-number">07</div>
            <div className="summary-subtext">3 require operator escalation</div>
          </div>
        </section>
      </div>
      <CyberSecurityPanel />
    </div>
  );
}
