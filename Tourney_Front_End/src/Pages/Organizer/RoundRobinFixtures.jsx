import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { useParams, useSearchParams } from "react-router-dom";
import {
  fetchTeams,
  fetchFixtures,
  updateFixture,
  fetchStandings,
  generateFixtures,
  fetchEvents,
  generateKnockout,
} from "../../lib/api.js";

const RoundRobinFixtures = () => {
  const navigate = useNavigate();
  const { id: tournamentId } = useParams();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId");

  const [fixtures, setFixtures] = useState([]);
  const [standings, setStandings] = useState([]);
  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creatingKO, setCreatingKO] = useState(false);
  const [currentFixture, setCurrentFixture] = useState(null);
  const [scoreAInput, setScoreAInput] = useState("");
  const [scoreBInput, setScoreBInput] = useState("");
  const [teamsMap, setTeamsMap] = useState({});

  // build quick id->name map
  const buildMap = (teams) =>
    Object.fromEntries(teams.map((t) => [t._id, t.name || t.teamName]));

  // load events list
  useEffect(() => {
    (async () => {
      try {
        const evs = await fetchEvents(tournamentId);
        setEvents(evs);
      } catch (err) {
        console.error("Failed to load events", err);
      }
    })();
  }, [tournamentId]);

  useEffect(() => {
    (async () => {
      try {
        const ts = await fetchTeams(tournamentId, eventId);
        setTeamsMap(buildMap(ts));
        let fx = await fetchFixtures(tournamentId, eventId);
        if (!Array.isArray(fx) || fx.length === 0) {
          // attempt to generate round-robin fixtures (first phase of hybrid)
          fx = await generateFixtures(tournamentId, eventId);
        }
        setFixtures((fx || []).filter((f) => !f.phase || f.phase === "rr"));
        const st = await fetchStandings(tournamentId, eventId);
        setStandings(st);
      } catch (err) {
        console.error("Failed to load RR data", err);
      }
    })();
  }, [tournamentId, eventId]);

  const groupedFixtures = useMemo(() => {
    const groups = {};
    fixtures.forEach((f) => {
      if (!groups[f.round]) groups[f.round] = [];
      groups[f.round].push(f);
    });
    return Object.entries(groups)
      .sort((a, b) => a[0] - b[0])
      .map(([rnd, list]) => ({ round: Number(rnd), list }));
  }, [fixtures]);

  const handleScoreSubmit = async (fixtureId, scoreA, scoreB) => {
    try {
      await updateFixture(fixtureId, { scoreA, scoreB, status: "completed" });
      // refresh
      const fx = await fetchFixtures(tournamentId, eventId);
      setFixtures(fx);
      const st = await fetchStandings(tournamentId, eventId);
      setStandings(st);
    } catch (err) {
      console.error("Failed to update score", err);
    }
  };

  const selectedEvent = events.find((e) => e._id === eventId);
  const allScored = fixtures.length > 0 && fixtures.every((f) => f.scoreA != null && f.scoreB != null);

  return (
    <>
      <div className="container mx-auto p-4 space-y-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Round-Robin Fixtures</h2>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="event-select-label">Event</InputLabel>
            <Select
              labelId="event-select-label"
              label="Event"
              value={eventId || ""}
              onChange={(e) => {
                const val = e.target.value;
                const url = new URL(window.location.href);
                if (val) url.searchParams.set("eventId", val);
                else url.searchParams.delete("eventId");
                window.location.href = url.toString();
              }}
            >
              {events.map((ev) => (
                <MenuItem key={ev._id} value={ev._id}>
                  {ev.eventName || ev.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {groupedFixtures.map((grp) => (
          <div key={grp.round} className="mb-6">
            <h3 className="font-medium text-lg mb-2">Matchday {grp.round + 1}</h3>
            <table className="w-full text-sm border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Team A</th>
                  <th className="p-2 border">Score</th>
                  <th className="p-2 border">Team B</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {grp.list.map((fx) => {
                  const tA = teamsMap[fx.teamA] || "TBD";
                  const tB = teamsMap[fx.teamB] || "TBD";
                  return (
                    <tr key={fx._id} className="text-center">
                      <td className="p-2 border">{tA}</td>
                      <td className="p-2 border">
                        {fx.scoreA != null && fx.scoreB != null
                          ? `${fx.scoreA} - ${fx.scoreB}`
                          : "-"}
                      </td>
                      <td className="p-2 border">{tB}</td>
                      <td className="p-2 border">
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs"
                          onClick={() => {
                            setCurrentFixture(fx);
                            setScoreAInput(fx.scoreA != null ? fx.scoreA : "");
                            setScoreBInput(fx.scoreB != null ? fx.scoreB : "");
                            setDialogOpen(true);
                          }}
                        >
                          {fx.scoreA != null ? "Edit" : "Enter"} Score
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        {(selectedEvent?.matchType === "round-robin-knockout" || selectedEvent?.matchType === "hybrid") && allScored && (
          <Button
            variant="contained"
            color="success"
            disabled={creatingKO}
            onClick={async () => {
              try {
                setCreatingKO(true);
                await generateKnockout(tournamentId, selectedEvent._id, 4);
                navigate(`/organizer/tournament/${tournamentId}/fixtures?eventId=${selectedEvent._id}`);
              } catch (err) {
                console.error("Failed to create KO", err);
              } finally {
                setCreatingKO(false);
              }
            }}
          >
            {creatingKO ? "Creating..." : "Generate Knock-out Stage"}
          </Button>
        )}
        <h2 className="text-xl font-semibold mt-10">Standings</h2>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border text-left">#</th>
            <th className="p-2 border text-left">Team</th>
            <th className="p-2 border">P</th>
            <th className="p-2 border">W</th>
            <th className="p-2 border">D</th>
            <th className="p-2 border">L</th>
            <th className="p-2 border">GF</th>
            <th className="p-2 border">GA</th>
            <th className="p-2 border">Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, idx) => (
            <tr key={s.teamId} className="text-center">
              <td className="p-2 border text-left">{idx + 1}</td>
              <td className="p-2 border text-left">{teamsMap[s.teamId]}</td>
              <td className="p-2 border">{s.played}</td>
              <td className="p-2 border">{s.won}</td>
              <td className="p-2 border">{s.draw}</td>
              <td className="p-2 border">{s.lost}</td>
              <td className="p-2 border">{s.goalsFor}</td>
              <td className="p-2 border">{s.goalsAgainst}</td>
              <td className="p-2 border font-semibold">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Enter Score</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <div className="flex flex-col gap-4 py-2">
            <TextField
              label={teamsMap[currentFixture?.teamA] || "Team A"}
              type="number"
              value={scoreAInput}
              onChange={(e) => setScoreAInput(e.target.value)}
              fullWidth
            />
            <TextField
              label={teamsMap[currentFixture?.teamB] || "Team B"}
              type="number"
              value={scoreBInput}
              onChange={(e) => setScoreBInput(e.target.value)}
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              await handleScoreSubmit(
                currentFixture._id,
                Number(scoreAInput),
                Number(scoreBInput)
              );
              setDialogOpen(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RoundRobinFixtures;
