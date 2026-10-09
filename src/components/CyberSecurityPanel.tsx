import { useMemo, useState } from "react";
import { Activity, Camera, LockKeyhole, Network, ShieldAlert, Video } from "lucide-react";
import { DEMO_CAMERAS } from "../services/demoData";
import { useCyberSecurity } from "../context/CyberSecurityContext";
import type { SecurityEventKind } from "../types";

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#f59e0b",
  LOW: "#22c55e",
  INFO: "#22d3ee",
};

const SIMULATION_BUTTONS: { label: string; kind: SecurityEventKind; icon: typeof LockKeyhole }[] = [
  { label: "Simulate Unauthorized Access", kind: "UNAUTHORIZED_ACCESS", icon: LockKeyhole },
  { label: "Simulate Network Anomaly", kind: "NETWORK_ANOMALY", icon: Network },
  { label: "Simulate Video Tampering", kind: "VIDEO_TAMPERING", icon: Video },
  { label: "Simulate Unknown Device", kind: "UNKNOWN_DEVICE", icon: Camera },
  { label: "Simulate Camera Compromise", kind: "CAMERA_COMPROMISE", icon: ShieldAlert },
];

export default function CyberSecurityPanel() {
  const { profiles, events, incidents, simulateCyberEvent, simulatePhysicalIntrusion, simulateCyberPhysicalAttack } = useCyberSecurity();
  const [cameraId, setCameraId] = useState("CAM-03");
  const profilesList = Object.values(profiles);
  const cyberEvents = events.filter((event) => event.kind !== "PHYSICAL_INTRUSION" && event.kind !== "CYBER_PHYSICAL");
  const avgTrust = profilesList.length
    ? Math.round(profilesList.reduce((total, profile) => total + profile.trust_score, 0) / profilesList.length)
    : 0;
  const highRiskIncidents = incidents.filter((incident) => incident.risk_level === "HIGH" || incident.risk_level === "CRITICAL");
  const recentEvents = useMemo(() => events.slice(0, 6), [events]);

  const trigger = (kind: SecurityEventKind) => {
    if (kind === "PHYSICAL_INTRUSION") simulatePhysicalIntrusion(cameraId);
    else if (kind === "CYBER_PHYSICAL") simulateCyberPhysicalAttack(cameraId);
    else simulateCyberEvent(kind, cameraId);
  };

  return (
    <section className="panel cyber-panel">
      <div className="panel-header">
        <div className="panel-title-wrap">
          <div className="panel-dot cyan" />
          <span>CYBERSECURITY & CAMERA INTEGRITY</span>
        </div>
        <span className="cyber-live-indicator"><Activity size={12} /> SIMULATION READY</span>
      </div>

      <div className="cyber-usp">
        <div>
          <div className="cyber-usp-kicker">THE CAMERA TRUST QUESTION</div>
          <h2>Can we trust what the camera is showing?</h2>
          <p>Dynamic camera trust score + cyber-physical threat correlation</p>
        </div>
        <div className="cyber-usp-score">
          <span>AVERAGE CAMERA TRUST</span>
          <strong>{avgTrust}<small>/100</small></strong>
        </div>
      </div>

      <div className="cyber-metrics">
        {[
          { label: "ACTIVE CYBER THREATS", value: cyberEvents.filter((event) => event.status === "ACTIVE").length, color: "#f97316" },
          { label: "SUSPICIOUS CAMERAS", value: profilesList.filter((profile) => profile.status === "SUSPICIOUS").length, color: "#f59e0b" },
          { label: "COMPROMISED CAMERAS", value: profilesList.filter((profile) => profile.status === "COMPROMISED").length, color: "#ef4444" },
          { label: "HIGH-RISK INCIDENTS", value: highRiskIncidents.length, color: "#ef4444" },
        ].map((metric) => (
          <div key={metric.label} className="cyber-metric">
            <span>{metric.label}</span>
            <strong style={{ color: metric.color }}>{String(metric.value).padStart(2, "0")}</strong>
          </div>
        ))}
      </div>

      <div className="cyber-profiles">
        {DEMO_CAMERAS.map((camera) => {
          const profile = profiles[camera.camera_id] ?? {
            camera_id: camera.camera_id,
            trust_score: 90,
            status: "TRUSTED" as const,
            cyber_risk: "LOW" as const,
            physical_risk: "LOW" as const,
            trusted_ips: [],
            has_unknown_ip: false,
            reconnect_events: 0,
          };
          const scoreColor = profile.trust_score >= 80 ? "#22c55e" : profile.trust_score >= 40 ? "#f59e0b" : "#ef4444";
          return (
            <div className="cyber-camera-card" key={camera.camera_id}>
              <div className="cyber-camera-top">
                <span>{camera.camera_id}</span>
                <span style={{ color: profile.status === "TRUSTED" ? "#22c55e" : profile.status === "SUSPICIOUS" ? "#f59e0b" : "#ef4444" }}>{profile.status}</span>
              </div>
              <div className="cyber-camera-name">{camera.name}</div>
              <div className="cyber-score-row">
                <strong style={{ color: scoreColor }}>{profile.trust_score}<small>/100</small></strong>
                <span>{profile.cyber_risk} CYBER RISK</span>
              </div>
              <div className="cyber-score-track"><span style={{ width: `${profile.trust_score}%`, background: scoreColor }} /></div>
              <div className="cyber-camera-ip">{profile.has_unknown_ip ? "UNKNOWN DEVICE SEEN" : "KNOWN DEVICES ONLY"}</div>
            </div>
          );
        })}
      </div>

      <div className="cyber-simulation">
        <div className="cyber-simulation-heading">
          <div>
            <div className="cyber-subheading">SAFE DEMO SIMULATIONS</div>
            <div className="cyber-hint">Simulated telemetry only — no real devices or networks are contacted.</div>
          </div>
          <label className="cyber-camera-select">
            <span>CAMERA</span>
            <select value={cameraId} onChange={(event) => setCameraId(event.target.value)}>
              {DEMO_CAMERAS.map((camera) => <option key={camera.camera_id} value={camera.camera_id}>{camera.camera_id}</option>)}
            </select>
          </label>
        </div>
        <div className="cyber-action-grid">
          {SIMULATION_BUTTONS.map(({ label, kind, icon: Icon }) => (
            <button key={kind} type="button" onClick={() => trigger(kind)}><Icon size={13} />{label}</button>
          ))}
          <button type="button" onClick={() => trigger("PHYSICAL_INTRUSION")}><Activity size={13} />Simulate Physical Intrusion</button>
          <button type="button" className="cyber-combo-action" onClick={() => trigger("CYBER_PHYSICAL")}><ShieldAlert size={13} />Simulate Cyber + Physical Attack</button>
        </div>
      </div>

      <div className="cyber-events-wrap">
        <div className="cyber-subheading">RECENT CYBER / PHYSICAL EVENTS</div>
        {recentEvents.length === 0 ? (
          <div className="cyber-empty">No simulated security events. Run a safe demo simulation to populate the shared event log.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cyber-events-table">
              <thead><tr>{["TYPE", "CAMERA", "SOURCE IP", "ATTEMPTS", "SEVERITY", "TIMESTAMP", "STATUS", "DETAILS"].map((heading) => <th key={heading}>{heading}</th>)}</tr></thead>
              <tbody>
                {recentEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.event_type}</td>
                    <td>{event.camera_id}</td>
                    <td>{event.source_ip || "AI / PHYSICAL"}</td>
                    <td>{event.attempts ?? "—"}</td>
                    <td style={{ color: SEVERITY_COLORS[event.severity] }}>{event.severity}</td>
                    <td>{new Date(event.timestamp).toLocaleTimeString()}</td>
                    <td>{event.status}</td>
                    <td className="cyber-event-description">{event.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {highRiskIncidents.length > 0 && (
        <div className="cyber-incident-banner">
          <ShieldAlert size={16} />
          <div><strong>CRITICAL INCIDENT — {highRiskIncidents[0].threat_type}</strong><span>{highRiskIncidents[0].camera_id} · Trust {profiles[highRiskIncidents[0].camera_id]?.trust_score ?? "—"}/100 · {new Date(highRiskIncidents[0].timestamp).toLocaleTimeString()}</span></div>
        </div>
      )}
    </section>
  );
}
