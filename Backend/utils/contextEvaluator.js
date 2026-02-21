/**
 * Evaluates the security context of a transaction.
 * 
 * IMPORTANT DESIGN DECISIONS:
 * - IP/Device: Only penalise when a trusted list EXISTS and the current value isn't in it.
 * - Location: Only penalise when location is CONTINUOUSLY changing, not for a single unfamiliar reading.
 * - Typing speed: Only penalise sustained very-fast input (< 50ms between keys), not when data is missing.
 * - Tab switches: Only penalise rapid sustained switching (> 3/min), not occasional switches.
 * - FPS drops: Only penalise sustained drops (> 5/min rate).
 */
export function evaluateContext(context, userProfile) {
  let riskScore = 0;

  // IP check — only penalise if the user HAS trusted IPs and the current one isn't included
  if (
    Array.isArray(userProfile.trustedIPs) &&
    userProfile.trustedIPs.length > 0 &&
    !userProfile.trustedIPs.includes(context.ip)
  ) {
    riskScore += 1;
    console.log("Risk: IP not trusted:", context.ip);
  }

  // Device check — partial match on first 60 chars (browser versions change)
  if (
    Array.isArray(userProfile.trustedDevices) &&
    userProfile.trustedDevices.length > 0
  ) {
    const currentDevice = context.device || "";
    const deviceMatched = userProfile.trustedDevices.some(d => {
      if (d === currentDevice) return true;
      if (d && currentDevice && d.slice(0, 60) === currentDevice.slice(0, 60)) return true;
      return false;
    });
    if (!deviceMatched) {
      riskScore += 1;
      console.log("Risk: Device not trusted:", currentDevice.slice(0, 60));
    }
  }

  // Login time check
  const loginHour = new Date(context.loginTime).getHours();
  if (loginHour < 6 || loginHour > 22) {
    riskScore += 1;
    console.log("Risk: Login at unusual hour:", loginHour);
  }

  // Location check — only penalise if locationChanging flag is set (continuous movement)
  // If no locationChanging flag from frontend, fall back to checking against stored locations
  if (context.locationChanging === true) {
    riskScore += 2; // Continuous location change is more suspicious
    console.log("Risk: Location continuously changing");
  } else if (
    context.location &&
    typeof context.location.latitude === "number" &&
    typeof context.location.longitude === "number" &&
    Array.isArray(userProfile.locations) &&
    userProfile.locations.length > 0
  ) {
    const locationMatch = userProfile.locations.some(
      (loc) =>
        typeof loc.lat === "number" &&
        typeof loc.lon === "number" &&
        Math.abs(loc.lat - context.location.latitude) < 0.5 &&
        Math.abs(loc.lon - context.location.longitude) < 0.5
    );
    if (!locationMatch) {
      riskScore += 1;
      console.log("Risk: Location not in trusted locations:", context.location);
    }
  }
  // If no locations configured, don't penalise

  // Typing speed — only penalise sustained very fast input
  // typingSpeed = 0 means no data, which is OK
  if (typeof context.typingSpeed === "number" && context.typingSpeed > 0 && context.typingSpeed < 50) {
    riskScore += 1;
    console.log("Risk: Typing speed too fast (possible bot):", context.typingSpeed);
  }

  // Cursor movements — lenient check
  if (
    Array.isArray(context.cursorMovements) &&
    context.cursorMovements.length > 0 &&
    context.cursorMovements.length < 5
  ) {
    riskScore += 1;
    console.log("Risk: Very few cursor movements:", context.cursorMovements.length);
  }

  // Tab switches — only penalise sustained rapid switching
  const tabSwitchRate = context.tabSwitchRate || 0;
  if (tabSwitchRate > 3) {
    riskScore += 1;
    console.log("Risk: High tab switch rate:", tabSwitchRate, "switches/min");
  }

  // FPS drops — only penalise sustained drops
  const fpsDropRate = context.fpsDropRate || 0;
  if (fpsDropRate > 5) {
    riskScore += 1;
    console.log("Risk: High FPS drop rate:", fpsDropRate, "drops/min");
  }

  return riskScore;
}
