// useContextData.js
// Collects behavioural context data for security analysis.
// Warnings are only triggered for SUSTAINED rapid changes, not single snapshots.
import { useEffect, useState, useRef, useCallback } from "react";
import { getBrowserName } from "../utils/getBrowserName";

const useContextData = () => {
  const [context, setContext] = useState({
    typingTimestamps: [],
    typingSpeed: 0,          // avg ms between keystrokes (higher = slower = more human)
    cursorMovements: [],
    tabSwitches: 0,
    tabSwitchRate: 0,        // switches per minute — only alert if sustained rapid switching
    screenFPSDrops: 0,
    fpsDropRate: 0,           // drops per minute — only alert if sustained
    ip: "",
    location: null,
    locationHistory: [],     // track location changes over time
    locationChanging: false, // true only if location keeps changing rapidly
    device: navigator.userAgent,
    language: navigator.language,
    browser: getBrowserName(),
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    loginTime: new Date().toISOString(),
  });

  const startTimeRef = useRef(Date.now());
  const tabSwitchTimesRef = useRef([]);
  const fpsDropTimesRef = useRef([]);
  const locationHistoryRef = useRef([]);
  const typingTimesRef = useRef([]);

  // ────── Typing speed tracking ──────
  const handleKeyDown = useCallback(() => {
    const now = Date.now();
    typingTimesRef.current.push(now);
    // Keep only last 30 keystrokes for speed calc
    if (typingTimesRef.current.length > 30) {
      typingTimesRef.current = typingTimesRef.current.slice(-30);
    }

    const times = typingTimesRef.current;
    if (times.length >= 2) {
      const deltas = times.slice(1).map((t, i) => t - times[i]);
      const avg = deltas.reduce((a, b) => a + b, 0) / deltas.length;
      setContext(prev => ({
        ...prev,
        typingTimestamps: [...prev.typingTimestamps.slice(-29), now],
        typingSpeed: Number(avg.toFixed(2)),
      }));
    } else {
      setContext(prev => ({
        ...prev,
        typingTimestamps: [...prev.typingTimestamps.slice(-29), now],
      }));
    }
  }, []);

  // ────── Cursor tracking (throttled) ──────
  useEffect(() => {
    let lastRecord = 0;
    const handleMove = (e) => {
      const now = Date.now();
      // Throttle: record at most every 200ms to avoid massive arrays
      if (now - lastRecord < 200) return;
      lastRecord = now;
      setContext(prev => ({
        ...prev,
        cursorMovements: [
          ...prev.cursorMovements.slice(-49), // keep last 50 movements
          { x: e.clientX, y: e.clientY, t: now },
        ],
      }));
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  // ────── Tab visibility tracking ──────
  // Only warn if user is switching tabs rapidly (>3 times per minute sustained)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        const now = Date.now();
        tabSwitchTimesRef.current.push(now);
        // Only keep switches from the last 2 minutes
        const twoMinAgo = now - 120000;
        tabSwitchTimesRef.current = tabSwitchTimesRef.current.filter(t => t > twoMinAgo);

        const totalSwitches = tabSwitchTimesRef.current.length;
        const minutesElapsed = Math.max((now - startTimeRef.current) / 60000, 0.5);
        const rate = totalSwitches / minutesElapsed;

        setContext(prev => ({
          ...prev,
          tabSwitches: totalSwitches,
          tabSwitchRate: Number(rate.toFixed(2)),
        }));
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // ────── FPS drop detection ──────
  // Only count significant drops (>200ms gap) and track rate
  useEffect(() => {
    let last = performance.now();
    let rafId;

    const checkFPS = () => {
      const now = performance.now();
      // Only count significant drops (>200ms = <5fps)
      if (now - last > 200) {
        fpsDropTimesRef.current.push(Date.now());
        // Only keep drops from the last 2 minutes
        const twoMinAgo = Date.now() - 120000;
        fpsDropTimesRef.current = fpsDropTimesRef.current.filter(t => t > twoMinAgo);

        const drops = fpsDropTimesRef.current.length;
        const minutesElapsed = Math.max((Date.now() - startTimeRef.current) / 60000, 0.5);
        const rate = drops / minutesElapsed;

        setContext(prev => ({
          ...prev,
          screenFPSDrops: drops,
          fpsDropRate: Number(rate.toFixed(2)),
        }));
      }
      last = now;
      rafId = requestAnimationFrame(checkFPS);
    };

    rafId = requestAnimationFrame(checkFPS);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // ────── IP and Geolocation ──────
  useEffect(() => {
    const getIP = async () => {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        setContext(prev => ({ ...prev, ip: data.ip }));
      } catch { }
    };

    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            latitude: pos.coords.latitude || 0,
            longitude: pos.coords.longitude || 0,
          };
          const now = Date.now();
          locationHistoryRef.current.push({ ...loc, t: now });

          // Keep last 10 location checks
          if (locationHistoryRef.current.length > 10) {
            locationHistoryRef.current = locationHistoryRef.current.slice(-10);
          }

          // Determine if location is "continuously changing"
          // Only flag if we have 3+ readings and location shifted significantly in all recent checks
          let isChanging = false;
          const hist = locationHistoryRef.current;
          if (hist.length >= 3) {
            const recent = hist.slice(-3);
            let shifts = 0;
            for (let i = 1; i < recent.length; i++) {
              const dlat = Math.abs(recent[i].latitude - recent[i - 1].latitude);
              const dlon = Math.abs(recent[i].longitude - recent[i - 1].longitude);
              if (dlat > 0.01 || dlon > 0.01) shifts++; // ~1km change
            }
            isChanging = shifts >= 2; // All recent readings show movement
          }

          setContext(prev => ({
            ...prev,
            location: loc,
            locationHistory: locationHistoryRef.current.slice(),
            locationChanging: isChanging,
          }));
        },
        () => {
          // If geolocation denied, set default
          setContext(prev => ({
            ...prev,
            location: prev.location || { latitude: 0, longitude: 0 },
          }));
        }
      );
    };

    getIP();
    getLocation();

    // Re-check location every 30 seconds to detect continuous changes
    const locationInterval = setInterval(getLocation, 30000);
    return () => clearInterval(locationInterval);
  }, []);

  return { context, handleKeyDown };
};

export default useContextData;
