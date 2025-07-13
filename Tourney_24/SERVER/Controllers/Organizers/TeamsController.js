import Team from "../../Models/Organizer/Teams.js";
import TeamIndividual from "../../Models/Organizer/TeamIndividual.js";
import TeamGroup from "../../Models/Organizer/TeamGroup.js";
import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import Fixture from "../../Models/Fixture/FixtureModel.js";

// util to delete from a model safely
const tryDeleteById = async (Model, id) => {
  try {
    const doc = await Model.findByIdAndDelete(id);
    return !!doc;
  } catch (_) {
    return false;
  }
};

// DELETE /api/organizer/teams/:teamId
export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    if (!isValidObjectId(teamId)) {
      return res.json({ success: false, message: "Invalid team id" });
    }

    // Attempt deletion across known team collections
    let deleted = false;
    deleted = await tryDeleteById(Team, teamId);
    if (!deleted) deleted = await tryDeleteById(TeamGroup, teamId);
    if (!deleted) deleted = await tryDeleteById(TeamIndividual, teamId);

    if (!deleted) {
      return res.json({ success: false, message: "Team not found" });
    }

    // Clean up fixtures containing this team
    await Fixture.deleteMany({ $or: [{ teamA: teamId }, { teamB: teamId }] });

    return res.json({ success: true, message: "Team deleted successfully" });
  } catch (error) {
    console.log("Error deleting team:", error);
    return res.json({ success: false, message: "Error deleting team" });
  }
};
