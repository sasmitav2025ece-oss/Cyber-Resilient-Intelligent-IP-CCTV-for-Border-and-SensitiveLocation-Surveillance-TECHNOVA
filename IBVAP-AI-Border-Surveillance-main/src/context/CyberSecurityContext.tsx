import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { DEMO_CAMERAS } from "../services/demoData";
import type { Alert, AlertSeverity, CameraTrustProfile, Incident, RiskLevel, SecurityEvent, SecurityEventKind } from "../types";

interface CyberSecurityContextValue {
  profiles: Record<string, CameraTrustProfile>;
  events: SecurityEvent[];
  alerts: Alert[];
  incidents: Incident[];
  simulateCyberEvent: (kind: Exclude<SecurityEventKind, "PHYSICAL_INTRUSION" | "CYBER_PHYSICAL">, cameraId?: string) => void;
  simulatePhysicalIntrusion: (cameraId?: string) => void;
  simulateCyberPhysicalAttack: (cameraId?: string) => void;
  updateCyberAlert: (id: string, status: Alert["status"]) => void;
  updateCyberIncident: (id: string, status: Incident["status"]) => void;
}

const CyberSecurityContext = createContext<CyberSecurityContextValue | null>(null);
const severityForScore = (score: number): RiskLevel => score <= 35 ? "CRITICAL" : score <= 60 ? "HIGH" : score <= 80 ? "MEDIUM" : "LOW";
const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const initialProfiles = Object.fromEntries(DEMO_CAMERAS.map((camera, index) => {
  const scores = [94, 91, 95, 89, 87, 82];
  const score = scores[index] ?? 90;
  return [camera.camera_id, {
    camera_id: camera.camera_id,
    trust_score: score,
    status: "TRUSTED" as const,
    cyber_risk: severityForScore(score),
    physical_risk: "LOW" as const,
    trusted_ips: [`10.24.${index + 1}.10`, `10.24.${index + 1}.11`],
    has_unknown_ip: false,
    reconnect_events: 0,
  }];
}));

const SIMULATIONS: Record<Exclude<SecurityEventKind, "PHYSICAL_INTRUSION" | "CYBER_PHYSICAL">, {
  label: string;
  description: (ip: string) => string;
  severity: AlertSeverity;
  penalty: number;
  sourceIp: string;
  attempts?: number;
}> = {
  UNAUTHORIZED_ACCESS: {
    label: "Unauthorized Access",
    description: (ip) => `5 rejected authentication attempts from ${ip} against the camera management interface.`,
    severity: "HIGH",
    penalty: 28,
    sourceIp: "198.51.100.42",
    attempts: 5,
  },
  NETWORK_ANOMALY: {
    label: "Network Anomaly",
    description: (ip) => `Traffic volume is 4.8× baseline with repeated connections from ${ip}.`,
    severity: "HIGH",
    penalty: 18,
    sourceIp: "198.51.100.73",
  },
  VIDEO_TAMPERING: {
    label: "Video Tampering",
    description: () => "Frozen/repeated frames and a brief stream interruption detected; feed integrity requires operator review.",
    severity: "HIGH",
    penalty: 24,
    sourceIp: "10.24.3.1",
  },
  UNKNOWN_DEVICE: {
    label: "Unknown Device",
    description: (ip) => `Untrusted device at ${ip} communicated with the camera; source is not in its trusted device list.`,
    severity: "MEDIUM",
    penalty: 18,
    sourceIp: "203.0.113.89",
  },
  CAMERA_COMPROMISE: {
    label: "Camera Compromise",
    description: (ip) => `Repeated reconnects and suspicious access from ${ip} indicate a potentially compromised camera.`,
    severity: "CRITICAL",
    penalty: 55,
    sourceIp: "198.51.100.42",
  },
  CAMERA_OFFLINE: {
    label: "Camera Offline",
    description: () => "Camera heartbeat is missing; stream availability requires operator verification.",
    severity: "HIGH",
    penalty: 20,
    sourceIp: "10.24.3.1",
  },
};

export function CyberSecurityProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Record<string, CameraTrustProfile>>(initialProfiles);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const profilesRef = useRef(profiles);
  const eventsRef = useRef(events);

  const addEvent = (event: SecurityEvent) => {
    eventsRef.current = [event, ...eventsRef.current];
    setEvents(eventsRef.current);
  };

  const addAlert = (event: SecurityEvent, title: string, incidentId?: string) => {
    const camera = DEMO_CAMERAS.find((item) => item.camera_id === event.camera_id);
    const alert: Alert = {
      id: makeId("alert"),
      security_event_id: event.id,
      incident_id: incidentId,
      camera_id: event.camera_id,
      severity: event.severity,
      title: title.toUpperCase(),
      description: `${event.description}${event.attempts ? ` Attempts: ${event.attempts}.` : ""}${event.source_ip ? ` Source IP: ${event.source_ip}.` : ""}`,
      status: "ACTIVE",
      acknowledged: false,
      risk_level: event.severity === "CRITICAL" ? "CRITICAL" : event.severity === "HIGH" ? "HIGH" : "MEDIUM",
      sector: camera?.sector,
      timestamp: event.timestamp,
    };
    setAlerts((current) => [alert, ...current]);
  };

  const addCorrelation = (physical: SecurityEvent, cyber: SecurityEvent, trustScore: number) => {
    const camera = DEMO_CAMERAS.find((item) => item.camera_id === physical.camera_id);
    const timestamp = new Date().toISOString();
    const incidentId = makeId("cyber-physical");
    const correlation: SecurityEvent = {
      id: makeId("event"),
      camera_id: physical.camera_id,
      kind: "CYBER_PHYSICAL",
      event_type: "Cyber + Physical Threat",
      source_ip: cyber.source_ip,
      severity: "CRITICAL",
      description: "Possible intrusion with CCTV security anomaly. A restricted-area human detection coincided with a camera cyber event.",
      timestamp,
      status: "ACTIVE",
    };
    addEvent(correlation);
    const incident: Incident = {
      id: incidentId,
      incident_code: `INC-CYBER-${new Date().toISOString().replace(/\D/g, "").slice(0, 14)}`,
      camera_id: physical.camera_id,
      camera_name: camera?.name,
      sector: camera?.sector,
      timestamp,
      object_type: "person",
      tracking_id: "P-SIM-01",
      confidence: 98,
      threat_type: "Possible intrusion with CCTV security anomaly",
      risk_score: 98,
      risk_level: "CRITICAL",
      status: "NEW",
      operator: "—",
      notes: "",
      ai_reasons: [
        "Human detected in restricted area by the physical/AI surveillance simulation.",
        `${cyber.event_type} detected on the same camera within the correlation window.`,
        `Camera trust score is ${trustScore}/100.`,
        "Correlated cyber and physical indicators require immediate human operator review.",
      ],
      timeline: [
        { time: physical.timestamp, event: physical.event_type, status: "done" },
        { time: cyber.timestamp, event: cyber.event_type, status: "done" },
        { time: timestamp, event: "Cyber-physical correlation raised as critical", status: "active" },
      ],
      created_at: timestamp,
    };
    setIncidents((current) => [incident, ...current]);
    addAlert(correlation, "Cyber + Physical Threat", incidentId);
  };

  const simulateCyberEvent = (
    kind: Exclude<SecurityEventKind, "PHYSICAL_INTRUSION" | "CYBER_PHYSICAL">,
    cameraId = "CAM-03",
  ) => {
    const simulation = SIMULATIONS[kind];
    const current = profilesRef.current[cameraId] ?? {
      camera_id: cameraId,
      trust_score: 95,
      status: "TRUSTED" as const,
      cyber_risk: "LOW" as const,
      physical_risk: "LOW" as const,
      trusted_ips: [],
      has_unknown_ip: false,
      reconnect_events: 0,
    };
    const score = Math.max(0, current.trust_score - simulation.penalty);
    const compromised = kind === "CAMERA_COMPROMISE" || score <= 35 || current.status === "COMPROMISED";
    const profile: CameraTrustProfile = {
      ...current,
      trust_score: score,
      status: compromised ? "COMPROMISED" : score < 80 ? "SUSPICIOUS" : "TRUSTED",
      cyber_risk: severityForScore(score),
      has_unknown_ip: kind === "UNKNOWN_DEVICE" || current.has_unknown_ip,
      last_cyber_event: new Date().toISOString(),
      last_network_activity: new Date().toISOString(),
      reconnect_events: current.reconnect_events + (kind === "CAMERA_COMPROMISE" ? 3 : 0),
    };
    profilesRef.current = { ...profilesRef.current, [cameraId]: profile };
    setProfiles(profilesRef.current);
    const event: SecurityEvent = {
      id: makeId("event"),
      camera_id: cameraId,
      kind,
      event_type: simulation.label,
      source_ip: simulation.sourceIp,
      attempts: simulation.attempts,
      severity: simulation.severity,
      description: simulation.description(simulation.sourceIp),
      timestamp: new Date().toISOString(),
      status: "ACTIVE",
    };
    addEvent(event);
    addAlert(event, simulation.label);

    const recentPhysical = eventsRef.current.find((item) =>
      item.camera_id === cameraId && item.kind === "PHYSICAL_INTRUSION" &&
      Date.now() - new Date(item.timestamp).getTime() <= 15 * 60 * 1000
    );
    if (recentPhysical) addCorrelation(recentPhysical, event, score);
  };

  const simulatePhysicalIntrusion = (cameraId = "CAM-03") => {
    const current = profilesRef.current[cameraId] ?? initialProfiles["CAM-03"];
    const timestamp = new Date().toISOString();
    const profile = { ...current, physical_risk: "CRITICAL" as const };
    profilesRef.current = { ...profilesRef.current, [cameraId]: profile };
    setProfiles(profilesRef.current);
    const physical: SecurityEvent = {
      id: makeId("event"),
      camera_id: cameraId,
      kind: "PHYSICAL_INTRUSION",
      event_type: "Physical Intrusion",
      severity: "HIGH",
      description: "Human detected in restricted area; AI track P-SIM-01 initiated for operator review.",
      timestamp,
      status: "ACTIVE",
    };
    const recentCyber = eventsRef.current.find((item) =>
      item.camera_id === cameraId && !["PHYSICAL_INTRUSION", "CYBER_PHYSICAL"].includes(item.kind) &&
      Date.now() - new Date(item.timestamp).getTime() <= 15 * 60 * 1000
    );
    addEvent(physical);
    if (recentCyber) {
      addAlert(physical, "Restricted Area Human Detection");
      addCorrelation(physical, recentCyber, profile.trust_score);
    } else {
      addAlert(physical, "Restricted Area Human Detection");
    }
  };

  const simulateCyberPhysicalAttack = (cameraId = "CAM-03") => {
    simulateCyberEvent("UNAUTHORIZED_ACCESS", cameraId);
    simulatePhysicalIntrusion(cameraId);
  };

  const updateCyberAlert = (id: string, status: Alert["status"]) => {
    const alert = alerts.find((item) => item.id === id);
    setAlerts((current) => current.map((item) => item.id === id
      ? { ...item, status, acknowledged: status !== "ACTIVE" }
      : item));
    if (alert?.security_event_id) {
      eventsRef.current = eventsRef.current.map((event) => event.id === alert.security_event_id ? { ...event, status } : event);
      setEvents(eventsRef.current);
    }
  };

  const updateCyberIncident = (id: string, status: Incident["status"]) => {
    setIncidents((current) => current.map((incident) => incident.id === id ? { ...incident, status } : incident));
  };

  return (
    <CyberSecurityContext.Provider value={{ profiles, events, alerts, incidents, simulateCyberEvent, simulatePhysicalIntrusion, simulateCyberPhysicalAttack, updateCyberAlert, updateCyberIncident }}>
      {children}
    </CyberSecurityContext.Provider>
  );
}

export function useCyberSecurity() {
  const context = useContext(CyberSecurityContext);
  if (!context) throw new Error("useCyberSecurity must be used within CyberSecurityProvider");
  return context;
}
