// Centralised API helpers for Fixtures-related calls only
// If you need more generic helpers, extend this module.

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const defaultFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(data.message || "Request failed");
  }
  return data;
};

export const fetchEvents = async (tournamentId) => {
  const data = await defaultFetch(
    `${BASE_URL}/api/organizer/allEvents/${tournamentId}`
  );
  // BE returns { success: true, message: [events] }
  if (Array.isArray(data?.message)) return data.message;
  if (Array.isArray(data?.events)) return data.events;
  return [];
};

export const fetchTeams = async (tournamentId, eventId) => {
  const url = new URL(
    `${BASE_URL}/api/organizer/fixtures/${tournamentId}/teams`
  );
  if (eventId) url.searchParams.append("eventId", eventId);
  const { teams } = await defaultFetch(url.toString());
  return teams;
};

export const fetchFixtures = async (tournamentId, eventId) => {
  const url = new URL(`${BASE_URL}/api/organizer/fixtures/${tournamentId}`);
  if (eventId) url.searchParams.append("eventId", eventId);
  const { fixtures } = await defaultFetch(url.toString());
  return fixtures;
};

export const generateFixtures = async (tournamentId, eventId) => {
  const body = eventId ? { eventId } : {};
  const { fixtures } = await defaultFetch(
    `${BASE_URL}/api/organizer/fixtures/${tournamentId}/generate`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
  return fixtures;
};

export const fetchStandings = async (tournamentId, eventId) => {
  const url = new URL(`${BASE_URL}/api/organizer/fixtures/${tournamentId}/standings`);
  if (eventId) url.searchParams.append("eventId", eventId);
  const { standings } = await defaultFetch(url.toString());
  return standings;
};

export const generateKnockout = async (tournamentId, eventId, qualifiers = 4) => {
  const body = { eventId, qualifiers };
  const { fixtures } = await defaultFetch(
    `${BASE_URL}/api/organizer/fixtures/${tournamentId}/generate-knockout`,
    {
      method: "POST",
      body: JSON.stringify(body),
    }
  );
  return fixtures;
};

export const deleteTeam = async (teamId) => {
  await defaultFetch(`${BASE_URL}/api/organizer/teams/${teamId}`, {
    method: "DELETE",
  });
};

export const updateFixture = async (fixtureId, payload) => {
  const { fixture } = await defaultFetch(
    `${BASE_URL}/api/organizer/fixtures/fixture/${fixtureId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
  return fixture;
};
