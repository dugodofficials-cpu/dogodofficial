import { beforeEach, describe, expect, it, vi } from 'vitest';

const requestMock = vi.fn();

vi.mock('axios', () => {
  return {
    default: {
      create: vi.fn(() => ({
        request: requestMock,
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
    },
    AxiosError: class AxiosError extends Error {},
  };
});

vi.mock('@/lib/utils/cookies', () => ({
  cookies: { getAuthToken: vi.fn(() => null) },
}));

vi.mock('@/util/paths', () => ({
  ROUTES: { ERROR: { RATE_LIMIT: '/error/rate-limit' } },
}));

import { apiClient } from './client';

describe('apiClient', () => {
  beforeEach(() => {
    requestMock.mockReset();
    requestMock.mockResolvedValue({ data: { ok: true } });
  });

  it('does not force application/json for FormData uploads', async () => {
    const formData = new FormData();
    formData.append('profilePicture', new Blob(['test'], { type: 'image/png' }), 'avatar.png');

    await apiClient('/users/123/profile-picture', {
      method: 'POST',
      body: formData,
    });

    expect(requestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.dugodofficial.com/users/123/profile-picture',
        method: 'POST',
        data: formData,
        headers: expect.not.objectContaining({ 'Content-Type': 'application/json' }),
      })
    );
  });
});
