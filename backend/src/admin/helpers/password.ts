import * as bcrypt from 'bcrypt';

export const hashPasswordBefore = async (request: any) => {
  if (request?.method !== 'post' || !request?.payload) return request;

  const payload = { ...request.payload };
  const password = payload.password;

  if (typeof password === 'string') {
    const trimmed = password.trim();
    if (trimmed.length === 0) {
      delete payload.password;
    } else {
      payload.password = await bcrypt.hash(trimmed, 10);
    }
  }

  return { ...request, payload };
};

export const stripPasswordFromResponse = (response: any) => {
  if (response?.record?.params?.password !== undefined) {
    delete response.record.params.password;
  }
  return response;
};
