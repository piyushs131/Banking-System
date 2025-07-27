export const getBrowserName = () => {
  const ua = navigator.userAgent;

  if (/chrome|crios|crmo/i.test(ua) && !/edge|edg|opr|opera/i.test(ua)) {
    return "Chrome";
  } else if (/firefox|fxios/i.test(ua)) {
    return "Firefox";
  } else if (/safari/i.test(ua) && !/chrome|crios|crmo/i.test(ua)) {
    return "Safari";
  } else if (/edg/i.test(ua)) {
    return "Edge";
  } else if (/opr|opera/i.test(ua)) {
    return "Opera";
  } else {
    return "Unknown";
  }
};
