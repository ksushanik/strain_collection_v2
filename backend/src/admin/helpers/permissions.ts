export const normalizePermissionsBefore = (request: any) => {
  if (request?.method !== 'post' || !request?.payload) return request;
  const payload = { ...request.payload };
  const rawPermissions = payload.permissions;

  if (Object.prototype.hasOwnProperty.call(payload, 'permissions')) {
    if (typeof rawPermissions === 'string') {
      try {
        payload.permissions = rawPermissions.trim()
          ? JSON.parse(rawPermissions)
          : {};
      } catch {
        payload.permissions = {};
      }
    } else if (rawPermissions === null || typeof rawPermissions !== 'object') {
      payload.permissions = {};
    }
  }

  return { ...request, payload };
};
