export const isValidIPv4 = (ip: string): boolean => {
  const pattern =
    /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  return pattern.test(ip.trim());
};

export const isValidIPv6 = (ip: string): boolean => {
  // Simplified check — backend does full validation
  const pattern = /^(?:[0-9a-fA-F]{1,4}:){1,7}[0-9a-fA-F]{1,4}$|^::1$|^(?:[0-9a-fA-F]{1,4}:)*::(?:[0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^::$/;
  return pattern.test(ip.trim());
};

export const isValidIP = (ip: string): boolean =>
  isValidIPv4(ip) || isValidIPv6(ip);

export const isValidHostname = (hostname: string): boolean => {
  const pattern =
    /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
  return pattern.test(hostname.trim()) && hostname.length <= 253;
};

export const isValidASN = (asn: string): boolean => {
  return /^AS\d+$/i.test(asn.trim());
};