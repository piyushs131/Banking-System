import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Globe,
  Monitor,
  Clock,
  MapPin,
  Type,
  MousePointer,
  Layers,
  Activity,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const getStatusConfig = (ok, label) => {
  const baseConfig = {
    icon: ok ? CheckCircle : XCircle,
    color: ok ? "text-green-600" : "text-red-600",
    bgColor: ok ? "bg-green-50" : "bg-red-50",
    borderColor: ok ? "border-green-200" : "border-red-200",
    status: ok ? "Secure" : "Risk Detected",
  };

  const iconMap = {
    IP: Globe,
    Device: Monitor,
    Hour: Clock,
    Location: MapPin,
    Typing: Type,
    Cursor: MousePointer,
    Tabs: Layers,
    FPS: Activity,
  };

  return {
    ...baseConfig,
    icon: iconMap[label] || baseConfig.icon,
  };
};

const getDetailedInfo = (label, context, userProfile) => {
  switch (label) {
    case "IP":
      return {
        title: "IP Address Verification",
        description: context.ip ? `Current IP: ${context.ip}` : "IP not detected",
        details: userProfile.trustedIPs?.length
          ? `Trusted IPs: ${userProfile.trustedIPs.join(", ")}`
          : "No trusted IPs configured — add your IP in Services > Network Security",
      };
    case "Device":
      return {
        title: "Device Recognition",
        description: `Current: ${(context.device || "").slice(0, 60)}...`,
        details: userProfile.trustedDevices?.length
          ? `${userProfile.trustedDevices.length} trusted device(s) registered`
          : "No trusted devices — add yours in Services > Device Management",
      };
    case "Hour":
      return {
        title: "Login Time Analysis",
        description: `Login time: ${new Date(context.loginTime).toLocaleTimeString()}`,
        details: "Normal hours: 6 AM – 10 PM",
      };
    case "Location":
      return {
        title: "Geographic Location",
        description: context.location
          ? `Lat: ${context.location.latitude.toFixed(4)}, Lon: ${context.location.longitude.toFixed(4)}`
          : "Location not available",
        details: context.locationChanging
          ? "⚠ Location is continuously changing — possible spoofing"
          : "Location is stable",
      };
    case "Typing":
      return {
        title: "Typing Behavior",
        description: context.typingSpeed
          ? `Avg speed: ${context.typingSpeed} ms/keystroke`
          : "No typing data yet — type something to measure",
        details:
          context.typingSpeed === 0
            ? "Start typing to collect data"
            : context.typingSpeed >= 50
              ? "Typing speed is within normal human range"
              : "Typing speed is unusually fast (possible bot)",
      };
    case "Cursor":
      return {
        title: "Mouse Movement",
        description: `${context.cursorMovements?.length || 0} movements recorded`,
        details:
          (context.cursorMovements?.length || 0) >= 10
            ? "Sufficient cursor activity detected"
            : "Move your mouse to build activity data",
      };
    case "Tabs":
      return {
        title: "Tab Switching",
        description: `${context.tabSwitches || 0} switches (${context.tabSwitchRate || 0}/min)`,
        details:
          (context.tabSwitchRate || 0) <= 3
            ? "Normal browsing pattern"
            : "Rapid tab switching detected — may indicate automation",
      };
    case "FPS":
      return {
        title: "Screen Performance",
        description: `${context.screenFPSDrops || 0} drops (${context.fpsDropRate || 0}/min)`,
        details:
          (context.fpsDropRate || 0) <= 5
            ? "Normal screen performance"
            : "Frequent drops may indicate virtual environment or screen recording",
      };
    default:
      return { title: label, description: "", details: "" };
  }
};

const ContextStatus = ({ context, userProfile }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  if (!context || !userProfile) return null;

  // ─── Smart checks that respect the user's request ───
  // IP: OK if trusted or if no trusted IPs are configured yet
  const ipOk =
    (userProfile.trustedIPs || []).length === 0
      ? true // no IPs configured yet, don't penalize
      : (userProfile.trustedIPs || []).includes(context.ip);

  // Device: OK if current user-agent is in trusted list OR if the trusted list
  // contains a partial match (browsers add version numbers)
  const currentUA = context.device || "";
  const deviceOk =
    (userProfile.trustedDevices || []).length === 0
      ? true // no devices configured, don't penalize
      : (userProfile.trustedDevices || []).some((d) => {
        // Exact match
        if (d === currentUA) return true;
        // Partial match: same base browser signature (first 60 chars often stable)
        if (d && currentUA && d.slice(0, 60) === currentUA.slice(0, 60)) return true;
        return false;
      });

  // Hour: within 6-22
  const loginHour = new Date(context.loginTime).getHours();
  const hourOk = loginHour >= 6 && loginHour <= 22;

  // Location: OK if static OR if no trusted locations.
  // Only warn when location is CONTINUOUSLY changing (not static).
  const locationOk = !context.locationChanging;

  // Typing: OK if no data yet (user hasn't typed) OR if speed >= 50ms (human range)
  // Only warn if typing speed is rapidly changing (sustained very fast input)
  const typingSpeedOk =
    context.typingSpeed === 0
      ? true // no data collected yet, don't flag
      : context.typingSpeed >= 50; // normal human is 50-300ms between keys

  // Cursor: OK if some movements detected (10+) or if cursor data not required
  const cursorOk =
    (context.cursorMovements?.length || 0) >= 5; // reduced threshold

  // Tabs: Only flag if SUSTAINED rapid switching (>3 switches/min)
  const tabSwitchOk = (context.tabSwitchRate || 0) <= 3;

  // FPS: Only flag if SUSTAINED drops (>5 drops/min)
  const fpsOk = (context.fpsDropRate || 0) <= 5;

  const items = [
    { label: "IP", ok: ipOk },
    { label: "Device", ok: deviceOk },
    { label: "Hour", ok: hourOk },
    { label: "Location", ok: locationOk },
    { label: "Typing", ok: typingSpeedOk },
    { label: "Cursor", ok: cursorOk },
    { label: "Tabs", ok: tabSwitchOk },
    { label: "FPS", ok: fpsOk },
  ];

  const overallSecurityScore = Math.round(
    (items.filter((i) => i.ok).length / items.length) * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 mb-4 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--bank-primary)]/10">
            <Shield className="w-6 h-6 text-[var(--bank-primary)]" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Security Context Analysis
            </h3>
            <p className="text-sm text-gray-600">
              Real-time behavioral biometrics monitoring
            </p>
          </div>
        </div>

        {/* Overall Security Score */}
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">
            {overallSecurityScore}%
          </div>
          <div className="text-xs text-gray-500">Security Score</div>
          <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallSecurityScore}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-2 rounded-full ${overallSecurityScore >= 80
                  ? "bg-green-500"
                  : overallSecurityScore >= 60
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
            />
          </div>
        </div>
      </div>

      {/* Security Status Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item, index) => {
          const config = getStatusConfig(item.ok, item.label);
          const Icon = config.icon;
          const detailedInfo = getDetailedInfo(
            item.label,
            context,
            userProfile
          );

          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onHoverStart={() => setHoveredItem(item.label)}
              onHoverEnd={() => setHoveredItem(null)}
              className="relative group"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${config.bgColor} ${config.borderColor} hover:border-opacity-60 hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <span className={`text-xs font-semibold ${config.color}`}>
                    {config.status}
                  </span>
                </div>

                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800 mb-1">
                    {item.label}
                  </div>
                  <div className={`text-2xl ${config.color}`}>
                    {item.ok ? "✓" : "✗"}
                  </div>
                </div>

                {/* Tooltip */}
                {hoveredItem === item.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50"
                  >
                    <div className="bg-gray-900 border border-gray-600 rounded-lg p-4 shadow-xl max-w-xs">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4 text-[var(--bank-primary)]" />
                        <span className="font-semibold text-white">
                          {detailedInfo.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">
                        {detailedInfo.description}
                      </p>
                      {detailedInfo.details && (
                        <p className="text-xs text-gray-400">
                          {detailedInfo.details}
                        </p>
                      )}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Security Recommendations */}
      <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <span className="font-semibold text-gray-800">
            Security Recommendations
          </span>
        </div>

        <div className="space-y-2">
          {!ipOk && (
            <p className="text-sm text-gray-700">
              •{" "}
              <span className="text-yellow-600 font-medium">IP Address:</span>{" "}
              Current IP is not in your trusted list. Go to Services → Network Security to add it.
            </p>
          )}
          {!deviceOk && (
            <p className="text-sm text-gray-700">
              •{" "}
              <span className="text-yellow-600 font-medium">Device:</span> This
              device is not recognized. Go to Services → Device Management to trust it.
            </p>
          )}
          {!hourOk && (
            <p className="text-sm text-gray-700">
              •{" "}
              <span className="text-yellow-600 font-medium">Login Time:</span>{" "}
              Login outside normal hours (6 AM – 10 PM)
            </p>
          )}
          {!locationOk && (
            <p className="text-sm text-gray-700">
              •{" "}
              <span className="text-yellow-600 font-medium">Location:</span>{" "}
              Your location is continuously changing — this may indicate GPS spoofing
            </p>
          )}
          {!typingSpeedOk && (
            <p className="text-sm text-gray-700">
              •{" "}
              <span className="text-yellow-600 font-medium">
                Typing Behavior:
              </span>{" "}
              Unusually fast typing detected — sustained rapid input may indicate automation
            </p>
          )}
          {!cursorOk && (
            <p className="text-sm text-gray-700">
              •{" "}
              <span className="text-yellow-600 font-medium">
                Mouse Movement:
              </span>{" "}
              Insufficient activity — move your mouse to verify human presence
            </p>
          )}
          {!tabSwitchOk && (
            <p className="text-sm text-gray-700">
              •{" "}
              <span className="text-yellow-600 font-medium">
                Tab Switching:
              </span>{" "}
              Sustained rapid tab switching detected ({context.tabSwitchRate}/min) — may indicate automation
            </p>
          )}
          {!fpsOk && (
            <p className="text-sm text-gray-700">
              •{" "}
              <span className="text-yellow-600 font-medium">
                Screen Performance:
              </span>{" "}
              Sustained FPS drops detected ({context.fpsDropRate}/min) — possible virtual environment
            </p>
          )}

          {items.every((item) => item.ok) && (
            <p className="text-sm text-green-600 font-medium">
              ✓ All security checks passed. Your session appears secure.
            </p>
          )}
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  );
};

export default ContextStatus;