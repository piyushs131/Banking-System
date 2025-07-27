// utils/cleanBigInt.js
export default function cleanBigInt(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanBigInt);
  } else if (obj && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, cleanBigInt(v)])
    );
  } else if (typeof obj === 'bigint') {
    return obj.toString();
  }
  return obj;
}
