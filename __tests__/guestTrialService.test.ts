import { buildGuestTrialWindow, getGuestTrialStatus } from '../src/services/guestTrialService';

describe('guestTrialService', () => {
  it('builds 24-hour trial window', () => {
    const base = '2026-03-03T10:00:00.000Z';
    const window = buildGuestTrialWindow(base);

    expect(window.startedAt).toBe(base);
    expect(window.expiresAt).toBe('2026-03-04T10:00:00.000Z');
  });

  it('returns active status before expiration', () => {
    const status = getGuestTrialStatus(
      {
        guestTrialStartedAt: '2026-03-03T10:00:00.000Z',
        guestTrialExpiresAt: '2026-03-04T10:00:00.000Z',
      },
      new Date('2026-03-03T12:00:00.000Z'),
    );

    expect(status.isStarted).toBe(true);
    expect(status.isActive).toBe(true);
    expect(status.isExpired).toBe(false);
  });

  it('returns expired status after expiration', () => {
    const status = getGuestTrialStatus(
      {
        guestTrialStartedAt: '2026-03-03T10:00:00.000Z',
        guestTrialExpiresAt: '2026-03-04T10:00:00.000Z',
      },
      new Date('2026-03-05T00:00:00.000Z'),
    );

    expect(status.isStarted).toBe(true);
    expect(status.isActive).toBe(false);
    expect(status.isExpired).toBe(true);
  });
});
