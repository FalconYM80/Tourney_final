import mongoose from "mongoose";
import Tournament from "../../Models/Organizer/Tournament.js";
import Team from "../../Models/Organizer/Teams.js";
import Events from "../../Models/Organizer/Event.js";
import TeamIndividual from "../../Models/Organizer/TeamIndividual.js";
import TeamGroup from "../../Models/Organizer/TeamGroup.js";

// Lazy import to avoid circular deps
const getFixtureModel = async () => {
  const module = await import("../../Models/Fixture/FixtureModel.js");
  return module.default;
};

// Validate ObjectId helper
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper to map round index to readable name
const getRoundName = (roundNum, totalRounds) => {
  const roundsFromEnd = totalRounds - 1 - roundNum;
  if (roundsFromEnd === 0) return "Final";
  if (roundsFromEnd === 1) return "Semi-Final";
  if (roundsFromEnd === 2) return "Quarter-Final";
  if (roundsFromEnd === 3) return "Round of 16";
  return `Round ${roundNum + 1}`;
};

// ----------------- Controllers -----------------

// GET  /api/organizer/fixtures/:tournamentId/teams   (optionally ?eventId=)
export const getTeams = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { eventId } = req.query || {};

    if (!isValidId(tournamentId)) {
      return res.json({ success: false, message: "Invalid tournament id" });
    }

    // If eventId present, fetch participants based on event type
    if (eventId && isValidId(eventId)) {
      const event = await Events.findById(eventId);
      if (!event)
        return res.json({ success: false, message: "Event not found" });

      let participants = [];
      if (event.eventType2 === "individual") {
        participants = await TeamIndividual.find({ tournamentId, eventId });
        participants = participants.map((p) => ({ _id: p._id, name: p.name }));
      } else if (event.eventType2 === "group") {
        // For doubles/group events we want to surface the two player names as a readable pair
        const groups = await TeamGroup.find({ tournamentId, eventId }).lean();
        participants = groups.map((g) => {
          // Default to saved teamName
          let pairLabel = g.teamName;
          if (Array.isArray(g.members) && g.members.length >= 2) {
            const [m1, m2] = g.members;
            if (m1?.name && m2?.name) {
              pairLabel = `${m1.name} & ${m2.name}`;
            }
          }
          return {
            _id: g._id,
            name: pairLabel,
            teamName: g.teamName,
            members: g.members, // pass full members for richer client-side rendering
          };
        });
      }

      return res.json({ success: true, teams: participants });
    }

    // Fallback – classic teams attached to tournament
    const tournament = await Tournament.findById(tournamentId).populate(
      "teams"
    );
    if (!tournament) {
      return res.json({ success: false, message: "Tournament not found" });
    }

    const teams = tournament.teams.map((t) => ({
      _id: t._id,
      name: t.teamName,
    }));
    return res.json({ success: true, teams });
  } catch (error) {
    console.log("Error in getTeams:", error);
    return res.json({ success: false, message: "Error fetching teams" });
  }
};

// GET  /api/organizer/fixtures/:tournamentId
export const getFixtures = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { eventId } = req.query || {};

    if (!isValidId(tournamentId)) {
      return res.json({ success: false, message: "Invalid tournament id" });
    }

    const Fixture = await getFixtureModel();
    const filter = { tournament: tournamentId };
    if (eventId && isValidId(eventId)) {
      filter.event = eventId;
    }

    const fixtures = await Fixture.find(filter);

    return res.json({ success: true, fixtures });
  } catch (error) {
    console.log("Error in getFixtures:", error);
    return res.json({ success: false, message: "Error fetching fixtures" });
  }
};

// POST /api/organizer/fixtures/:tournamentId/generate
// Unified generator (RR only / KO only / Hybrid first phase)
export const generateFixtures = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { eventId, force = false } = req.body || {};

    if (!isValidId(tournamentId)) {
      return res.json({ success: false, message: "Invalid tournament id" });
    }

    const tournament = await Tournament.findById(tournamentId).populate(
      "teams"
    );
    if (!tournament) {
      return res.json({ success: false, message: "Tournament not found" });
    }

    let participants = [];

    if (eventId && isValidId(eventId)) {
      const event = await Events.findById(eventId);
      if (!event)
        return res.json({ success: false, message: "Event not found" });

      if (event.eventType2 === "individual") {
        const inds = await TeamIndividual.find({ tournamentId, eventId });
        participants = inds.map((p) => p._id.toString());
      } else if (event.eventType2 === "group") {
        const grps = await TeamGroup.find({ tournamentId, eventId }).lean();
        participants = grps.map((g) => g._id.toString());
      }
    }

    if (!participants.length) {
      // fallback to tournament teams
      participants = tournament.teams.map((t) => t._id.toString());
    }

    if (participants.length < 2) {
      return res.json({
        success: false,
        message: "Need at least 2 participants to generate fixtures",
      });
    }

    // Determine the match type for the event
    const evtMatchType = eventId ? (await Events.findById(eventId))?.matchType?.toLowerCase() : null;
    const isRoundRobin = evtMatchType?.includes("round-robin");
    const isHybridRRKO = evtMatchType === "round-robin-knockout";

    const Fixture = await getFixtureModel();

    if (isRoundRobin) {
      // If force flag, also clear any existing knockout fixtures for this event
      if (force) {
        await Fixture.deleteMany({
          tournament: tournamentId,
          ...(eventId ? { event: eventId } : {}),
          phase: "ko",
        });
      }
      // Always clear existing round-robin fixtures (including legacy fixtures with missing phase)
      await Fixture.deleteMany({
        tournament: tournamentId,
        ...(eventId ? { event: eventId } : {}),
        $or: [{ phase: "rr" }, { phase: { $exists: false } }, { phase: null }],
      });
      // ---------------- Round-Robin Generation ----------------
      // For hybrid events, only generate RR fixtures if none exist
      if (isHybridRRKO) {
        const existingRRFixtures = await Fixture.find({
          tournament: tournamentId,
          event: eventId,
          phase: "rr",
        });
        if (existingRRFixtures.length > 0) {
          if (!force) {
            return res.json({
              success: true,
              fixtures: existingRRFixtures,
              message: "Round-robin fixtures already exist",
            });
          }
          // force regenerate: delete existing RR fixtures for this event
          await Fixture.deleteMany({
            tournament: tournamentId,
            event: eventId,
            phase: "rr",
          });
        }
      } else {
        // For pure round-robin, clear existing fixtures
        await Fixture.deleteMany({
          tournament: tournamentId,
          ...(eventId ? { event: eventId } : {}),
        });
      }

      // --- Robust Round-Robin Generation (circle algorithm) ---
      let arr = [...participants];
      if (arr.length % 2 === 1) arr.push(null); // bye

      const totalRounds = arr.length - 1; // each team plays n-1
      const matchesPerRound = arr.length / 2;
      const docs = [];

      for (let round = 0; round < totalRounds; round++) {
        for (let i = 0; i < matchesPerRound; i++) {
          const teamA = arr[i];
          const teamB = arr[arr.length - 1 - i];
          if (teamA === null || teamB === null) continue; // skip bye
          docs.push({
            tournament: tournamentId,
            event: eventId,
            round,
            roundName: `Matchday ${round + 1}`,
            matchIndex: i,
            teamA,
            teamB,
            phase: "rr",
            status: "scheduled",
          });
        }
        // rotate array keeping first element fixed
        const last = arr.pop();
        arr.splice(1, 0, last);
      }

      const created = await Fixture.insertMany(docs);
      return res.json({ success: true, fixtures: created });
    }

    // ---------------- Knock-Out Generation ----------------

    // Shuffle participants
    participants = participants.sort(() => 0.5 - Math.random());

    // Pad to next power of 2 (knockout bracket)
    const nextPower = Math.pow(2, Math.ceil(Math.log2(participants.length)));
    while (participants.length < nextPower) participants.push(null);

    // Remove previous fixtures for this tournament/event
    await Fixture.deleteMany({
      tournament: tournamentId,
      ...(eventId ? { event: eventId } : {}),
    });

    const totalRounds = Math.log2(nextPower);
    const docs = [];
    let current = participants;
    let round = 0;

    while (current.length > 1) {
      for (let i = 0; i < current.length; i += 2) {
        docs.push({
          tournament: tournamentId,
          event: eventId,
          round,
          roundName: getRoundName(round, totalRounds),
          matchIndex: i / 2,
          teamA: current[i],
          teamB: current[i + 1],
          phase: "ko",
          status: "scheduled",
        });
      }
      current = new Array(current.length / 2).fill(null);
      round += 1;
    }

    const created = await Fixture.insertMany(docs);
    return res.json({ success: true, fixtures: created });
  } catch (error) {
    console.log("Error in generateFixtures:", error);
    return res.json({ success: false, message: "Error generating fixtures" });
  }
};

// PUT /api/organizer/fixtures/fixture/:fixtureId
export const updateFixture = async (req, res) => {
  try {
    const { fixtureId } = req.params;
    if (!isValidId(fixtureId)) {
      return res.json({ success: false, message: "Invalid fixture id" });
    }

    const Fixture = await getFixtureModel();

    const allowed = [
      "status",
      "scoreA",
      "scoreB",
      "winner",
      "scheduledAt",
      "notes",
    ];
    const updateData = {};
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) updateData[f] = req.body[f];
    });

    // If both scores provided and winner not explicitly set, derive winner
    if (
      updateData.scoreA !== undefined &&
      updateData.scoreB !== undefined &&
      updateData.winner === undefined
    ) {
      const scoreA = Number(updateData.scoreA);
      const scoreB = Number(updateData.scoreB);
      if (!isNaN(scoreA) && !isNaN(scoreB) && scoreA !== scoreB) {
        updateData.winner = scoreA > scoreB ? req.body.teamA : req.body.teamB;
      }
    }

    const updated = await Fixture.findByIdAndUpdate(fixtureId, updateData, {
      new: true,
    }).populate("teamA teamB winner");
    if (!updated)
      return res.json({ success: false, message: "Fixture not found" });

    // Derive winner from scores if not explicitly provided
    let winnerId = updateData.winner;
    if (!winnerId && updated.scoreA != null && updated.scoreB != null && updated.scoreA !== updated.scoreB) {
      const winnerDoc = updated.scoreA > updated.scoreB ? updated.teamA : updated.teamB;
      winnerId = winnerDoc?._id ? winnerDoc._id : winnerDoc; // ensure ObjectId
      updated.winner = winnerId;
      await updated.save();
    }

    // propagate winner to next round
    if (winnerId) {
      try {
        const nextFilter = {
          tournament: updated.tournament,
          event: updated.event,
          round: updated.round + 1,
          matchIndex: Math.floor(updated.matchIndex / 2),
        };
        const nextFix = await Fixture.findOne(nextFilter);
        if (nextFix) {
          if (updated.matchIndex % 2 === 0) {
            nextFix.teamA = winnerId;
          } else {
            nextFix.teamB = winnerId;
          }
          await nextFix.save();
        }
      } catch (err) {
        console.log("Error propagating winner:", err);
      }
    }

    return res.json({ success: true, fixture: updated });
  } catch (error) {
    console.log("Error in updateFixture:", error);
    return res.json({ success: false, message: "Error updating fixture" });
  }
};

// GET /api/organizer/fixtures/:tournamentId/standings
export const getStandings = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { eventId } = req.query || {};

    if (!isValidId(tournamentId)) {
      return res.json({ success: false, message: "Invalid tournament id" });
    }

    const Fixture = await getFixtureModel();
    const filter = { tournament: tournamentId };
    if (eventId && isValidId(eventId)) filter.event = eventId;

    // For hybrid events, only consider round-robin fixtures for standings
    if (eventId && isValidId(eventId)) {
      const event = await Events.findById(eventId);
      if (event && event.matchType === "round-robin-knockout") {
        filter.$or = [{ phase: "rr" }, { phase: { $exists: false } }, { phase: null }];
      }
    }

    const fixtures = await Fixture.find(filter);

    // stats map
    const stats = {};
    const ensure = (id) => {
      if (!id) return;
      if (!stats[id])
        stats[id] = {
          teamId: id,
          played: 0,
          won: 0,
          draw: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        };
    };

    fixtures.forEach((fx) => {
      if (fx.scoreA == null || fx.scoreB == null) return; // result not entered
      const a = fx.teamA?.toString();
      const b = fx.teamB?.toString();
      ensure(a);
      ensure(b);
      if (!a || !b) return;

      const sA = Number(fx.scoreA);
      const sB = Number(fx.scoreB);

      stats[a].played += 1;
      stats[b].played += 1;
      stats[a].goalsFor += sA;
      stats[a].goalsAgainst += sB;
      stats[b].goalsFor += sB;
      stats[b].goalsAgainst += sA;

      if (sA === sB) {
        stats[a].draw += 1;
        stats[b].draw += 1;
        stats[a].points += 1;
        stats[b].points += 1;
      } else if (sA > sB) {
        stats[a].won += 1;
        stats[b].lost += 1;
        stats[a].points += 3;
      } else {
        stats[b].won += 1;
        stats[a].lost += 1;
        stats[b].points += 3;
      }
    });

    const standings = Object.values(stats).sort((x, y) => {
      if (y.points !== x.points) return y.points - x.points;
      const gdY = y.goalsFor - y.goalsAgainst;
      const gdX = x.goalsFor - x.goalsAgainst;
      return gdY - gdX;
    });

    return res.json({ success: true, standings });
  } catch (error) {
    console.log("Error in getStandings:", error);
    return res.json({ success: false, message: "Error generating standings" });
  }
};

// ---------------- Generate Knockout Stage after Round-Robin ----------------
export const generateKnockoutFromStandings = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { eventId, qualifiers = 4 } = req.body;

    if (!isValidId(tournamentId) || !isValidId(eventId)) {
      return res.json({ success: false, message: "Invalid IDs" });
    }

    const event = await Events.findById(eventId);
    if (!event || !(event.matchType?.includes("round-robin") && event.matchType?.includes("knockout"))) {
      return res.json({ success: false, message: "Event is not RR+KO" });
    }

    const Fixture = await getFixtureModel();

    // accept both modern-tagged (phase:"rr") and legacy fixtures with no phase field
    const rrFixtures = await Fixture.find({
      tournament: tournamentId,
      event: eventId,
      $or: [{ phase: "rr" }, { phase: { $exists: false } }, { phase: null }],
    });
    // Ensure every RR fixture has result entered
    if (!rrFixtures.length) {
      return res.json({ success: false, message: "No round-robin fixtures found" });
    }

    // Compute standings
    const stats = {};
    const ensure = (id) => {
      if (!id) return;
      if (!stats[id]) stats[id] = { teamId: id, played: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    };

    rrFixtures.forEach((fx) => {
      if (fx.scoreA == null || fx.scoreB == null) return;
      const a = fx.teamA?.toString();
      const b = fx.teamB?.toString();
      ensure(a);
      ensure(b);
      if (!a || !b) return;
      const sA = Number(fx.scoreA);
      const sB = Number(fx.scoreB);
      stats[a].played += 1;
      stats[b].played += 1;
      stats[a].goalsFor += sA;
      stats[a].goalsAgainst += sB;
      stats[b].goalsFor += sB;
      stats[b].goalsAgainst += sA;
      if (sA === sB) {
        stats[a].draw += 1; stats[b].draw += 1; stats[a].points += 1; stats[b].points += 1;
      } else if (sA > sB) {
        stats[a].won += 1; stats[b].lost += 1; stats[a].points += 3;
      } else {
        stats[b].won += 1; stats[a].lost += 1; stats[b].points += 3;
      }
    });

    const standings = Object.values(stats).sort((x,y)=> y.points - x.points || (y.goalsFor - y.goalsAgainst) - (x.goalsFor - x.goalsAgainst));
    const qualifiedIds = standings.slice(0, qualifiers).map((s)=> s.teamId);
    if (qualifiedIds.length < 2) {
      return res.json({ success:false, message:`Need at least 2 qualified teams, got ${qualifiedIds.length}` });
    }

    // Determine new round index after RR
    const lastRR = await Fixture.findOne({ tournament: tournamentId, event: eventId, phase: "rr" }).sort({ round: -1 });
    const startRound = lastRR ? lastRR.round + 1 : 0;

    // Clear existing knockout fixtures for this event beyond startRound
    await Fixture.deleteMany({ tournament: tournamentId, event: eventId, round: { $gte: startRound }, phase: "ko" });

    // Order seeds for balanced bracket (1vsLast, 2vsSecondLast, ...)
    const participantsArr = [];
    let l = 0, r = qualifiedIds.length - 1;
    while (l <= r) {
      participantsArr.push(qualifiedIds[l]);
      if (l !== r) participantsArr.push(qualifiedIds[r]);
      l++; r--;
    }

    // pad to next power of two with null byes
    const nextPow = Math.pow(2, Math.ceil(Math.log2(participantsArr.length)));
    while (participantsArr.length < nextPow) participantsArr.push(null);

    const totalRoundsKO = Math.log2(nextPow);
    const docs = [];
    let current = participantsArr;
    let relRound = 0;
    while (current.length > 1) {
      for (let i = 0; i < current.length; i += 2) {
        docs.push({
          tournament: tournamentId,
          event: eventId,
          round: startRound + relRound,
          roundName: getRoundName(relRound, totalRoundsKO),
          matchIndex: i / 2,
          teamA: current[i],
          teamB: current[i+1],
          phase: "ko",
          status: "scheduled",
        });
      }
      current = new Array(current.length / 2).fill(null);
      relRound += 1;
    }

    const created = await Fixture.insertMany(docs);
    return res.json({ success:true, fixtures: created });
  } catch (error) {
    console.log("Error in generateKnockoutFromStandings:", error);
    return res.json({ success:false, message:"Error creating knockout stage" });
  }
};