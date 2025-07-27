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
  AlertTriangle
} from "lucide-react";

const getStatusConfig = (ok, label) => {
  const baseConfig = {
    icon: ok ? CheckCircle : XCircle,
    color: ok ? "text-green-600" : "text-red-600",
    bgColor: ok ? "bg-green-50" : "bg-red-50",
    borderColor: ok ? "border-green-200" : "border-red-200",
    status: ok ? "Secure" : "Risk Detected"
  };

  // Custom icons for specific checks
  const iconMap = {
    "IP": Globe,
    "Device": Monitor,
    "Hour": Clock,
    "Location": MapPin,
    "Typing": Type,
    "Cursor": MousePointer,
    "Tabs": Layers,
    "FPS": Activity
  };

  return {
    ...baseConfig,
    icon: iconMap[label] || baseConfig.icon
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
          : "No trusted IPs configured"
      };
    case "Device":
      return {
        title: "Device Recognition",
        description: context.device ? `Current device: ${context.device}` : "Device not detected",
        details: userProfile.trustedDevices?.length
          ? `Trusted devices: ${userProfile.trustedDevices.join(", ")}`
          : "No trusted devices configured"
      };
    case "Hour":
      const loginHour = new Date(context.loginTime).getHours();
      return {
        title: "Login Time Analysis",
        description: `Login time: ${loginHour}:00`,
        details: loginHour >= 6 && loginHour <= 22 
          ? "Within normal business hours (6 AM - 10 PM)"
          : "Outside normal business hours"
      };
    case "Location":
      return {
        title: "Geographic Location",
        description: context.location 
          ? `Lat: ${context.location.latitude.toFixed(4)}, Lon: ${context.location.longitude.toFixed(4)}`
          : "Location not detected",
        details: userProfile.locations?.length
          ? `${userProfile.locations.length} trusted locations configured`
          : "No trusted locations configured"
      };
    case "Typing":
      return {
        title: "Typing Behavior Analysis",
        description: context.typingSpeed 
          ? `Speed: ${context.typingSpeed} ms/char`
          : "Typing speed not measured",
        details: context.typingSpeed >= 300
          ? "Typing speed within normal human range"
          : "Typing speed may indicate automated behavior"
      };
    case "Cursor":
      return {
        title: "Mouse Movement Analysis",
        description: context.cursorMovements?.length
          ? `${context.cursorMovements.length} movements recorded`
          : "No cursor movements recorded",
        details: context.cursorMovements?.length >= 10
          ? "Sufficient cursor activity detected"
          : "Insufficient cursor activity for analysis"
      };
    case "Tabs":
      return {
        title: "Tab Switching Behavior",
        description: context.tabSwitches !== undefined
          ? `${context.tabSwitches} tab switches detected`
          : "Tab switching not monitored",
        details: context.tabSwitches <= 1
          ? "Normal tab switching behavior"
          : "Excessive tab switching may indicate suspicious activity"
      };
    case "FPS":
      return {
        title: "Screen Performance",
        description: context.screenFPSDrops !== undefined
          ? `${context.screenFPSDrops} FPS drops detected`
          : "Screen performance not monitored",
        details: context.screenFPSDrops <= 5
          ? "Normal screen performance"
          : "Performance issues may indicate virtual environment"
      };
    default:
      return {
        title: label,
        description: "No detailed information available",
        details: ""
      };
  }
};

const ContextStatus = ({ context, userProfile }) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  if (!context || !userProfile) return null;

  // Enhanced checks with more detailed logic
  const ipOk = userProfile.trustedIPs?.includes(context.ip);
  const deviceOk = userProfile.trustedDevices?.includes(context.device);
  const loginHour = new Date(context.loginTime).getHours();
  const hourOk = loginHour >= 6 && loginHour <= 22;

  let locationOk = false;
  if (
    context.location &&
    typeof context.location.latitude === "number" &&
    typeof context.location.longitude === "number" &&
    Array.isArray(userProfile.locations)
  ) {
    locationOk = userProfile.locations.some(
      (loc) =>
        typeof loc.lat === "number" &&
        typeof loc.lon === "number" &&
        Math.abs(loc.lat - context.location.latitude) < 0.5 &&
        Math.abs(loc.lon - context.location.longitude) < 0.5
    );
  }

  const typingSpeedOk = typeof context.typingSpeed === "number" && context.typingSpeed >= 300;
  const cursorOk = Array.isArray(context.cursorMovements) && context.cursorMovements.length >= 10;
  const tabSwitchOk = typeof context.tabSwitches === "number" && context.tabSwitches <= 1;
  const fpsOk = typeof context.screenFPSDrops === "number" && context.screenFPSDrops <= 5;

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

  const overallSecurityScore = Math.round((items.filter(item => item.ok).length / items.length) * 100);

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
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Security Context Analysis</h3>
            <p className="text-sm text-gray-600">Real-time behavioral biometrics monitoring</p>
          </div>
        </div>
        
        {/* Overall Security Score */}
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-800">{overallSecurityScore}%</div>
          <div className="text-xs text-gray-500">Security Score</div>
          <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallSecurityScore}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-2 rounded-full ${
                overallSecurityScore >= 80 ? 'bg-green-500' :
                overallSecurityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
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
          const detailedInfo = getDetailedInfo(item.label, context, userProfile);

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
                className={`p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  config.bgColor
                } ${config.borderColor} hover:border-opacity-60 hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${config.color}`} />
                  <span className={`text-xs font-semibold ${config.color}`}>
                    {config.status}
                  </span>
                </div>
                
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800 mb-1">{item.label}</div>
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
                        <Info className="w-4 h-4 text-blue-400" />
                        <span className="font-semibold text-white">{detailedInfo.title}</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-2">{detailedInfo.description}</p>
                      {detailedInfo.details && (
                        <p className="text-xs text-gray-400">{detailedInfo.details}</p>
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
          <span className="font-semibold text-gray-800">Security Recommendations</span>
        </div>
        
        <div className="space-y-2">
          {!ipOk && (
            <p className="text-sm text-gray-700">
              • <span className="text-yellow-600 font-medium">IP Address:</span> Current IP is not in your trusted list
            </p>
          )}
          {!deviceOk && (
            <p className="text-sm text-gray-700">
              • <span className="text-yellow-600 font-medium">Device:</span> This device is not recognized
            </p>
          )}
          {!hourOk && (
            <p className="text-sm text-gray-700">
              • <span className="text-yellow-600 font-medium">Login Time:</span> Login outside normal hours detected
            </p>
          )}
          {!locationOk && (
            <p className="text-sm text-gray-700">
              • <span className="text-yellow-600 font-medium">Location:</span> Login from unfamiliar location
            </p>
          )}
          {!typingSpeedOk && (
            <p className="text-sm text-gray-700">
              • <span className="text-yellow-600 font-medium">Typing Behavior:</span> Unusual typing patterns detected
            </p>
          )}
          {!cursorOk && (
            <p className="text-sm text-gray-700">
              • <span className="text-yellow-600 font-medium">Mouse Movement:</span> Insufficient cursor activity
            </p>
          )}
          {!tabSwitchOk && (
            <p className="text-sm text-gray-700">
              • <span className="text-yellow-600 font-medium">Tab Switching:</span> Excessive tab switching detected
            </p>
          )}
          {!fpsOk && (
            <p className="text-sm text-gray-700">
              • <span className="text-yellow-600 font-medium">Screen Performance:</span> Performance issues detected
            </p>
          )}
          
          {items.every(item => item.ok) && (
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