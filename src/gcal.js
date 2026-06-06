const SCOPE = 'https://www.googleapis.com/auth/calendar.events'
const CAL_ID = 'primary'
const SOURCE = 'life-os-quest'

const MISSION_EMOJIS = {
  reading: '📚',
  workout: '🏋️',
  'ai-coding': '💻',
  'parent-talk': '💬',
  'weekend-review': '📋',
  memo: '📝',
}

export function initTokenClient(clientId, callback) {
  return window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPE,
    callback,
  })
}

async function apiFetch(token, path, options = {}) {
  const res = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (res.status === 204) return null
  return res.json()
}

export async function listLifeOsEvents(token, dateStr) {
  const params = new URLSearchParams({
    timeMin: `${dateStr}T00:00:00Z`,
    timeMax: `${dateStr}T23:59:59Z`,
    privateExtendedProperty: `source=${SOURCE}`,
    singleEvents: 'true',
    maxResults: '50',
  })
  const data = await apiFetch(token, `/calendars/${encodeURIComponent(CAL_ID)}/events?${params}`)
  return data?.items ?? []
}

export async function createCalendarEvent(token, { date, missionId, missionName, detail, userNames, xp }) {
  const emoji = MISSION_EMOJIS[missionId] ?? '⭐'
  return apiFetch(token, `/calendars/${encodeURIComponent(CAL_ID)}/events`, {
    method: 'POST',
    body: JSON.stringify({
      summary: `${emoji} ${missionName} — ${userNames.join(', ')}`,
      description: `${detail}\n\n+${xp} XP · Life OS Quest`,
      start: { date },
      end: { date },
      extendedProperties: {
        private: { source: SOURCE, lifeOsKey: `${date}:${missionId}` },
      },
    }),
  })
}

export async function deleteCalendarEvent(token, eventId) {
  return apiFetch(token, `/calendars/${encodeURIComponent(CAL_ID)}/events/${eventId}`, { method: 'DELETE' })
}
