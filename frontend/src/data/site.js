/**
 * Site-wide constants (agency contact + eclipse facts).
 */
export const site = {
  agency: 'Vibes Trip',
  whatsappNumbers: [
    { display: '+216 93 306 933', wa: '21693306933' },
    { display: '+216 93 360 933', wa: '21693360933' },
  ],
  /** Number used for the "Confirm on WhatsApp" button. */
  bookingWhatsapp: '21693306933',
};

export const eclipse = {
  /** Countdown target: 2 Aug 2027 10:08 Tunisia time (UTC+1, no DST). */
  countdownTarget: '2027-08-02T10:08:00+01:00',
  date: '2027-08-02',
  partialStart: '08:55',
  partialEnd: '11:32',
  meetingTime: '08:30',
};
