import bcrypt from "bcryptjs";
import cloudinary from "../../Config/cloudinary.js";
import validator from "validator";
import Fixture from "../../Models/Fixture/FixtureModel.js";
import Organizer from "../../Models/Organizer/OrganizerModel.js";
import Tournament from "../../Models/Organizer/Tournament.js";
import Events from "../../Models/Organizer/Event.js";
import PlayerModel from "../../Models/Player/PlayerModel.js";
// import Team from '../../Models/Organizer/Teams.js';

import TeamIndividual from "../../Models/Organizer/TeamIndividual.js";
import TeamGroup from "../../Models/Organizer/TeamGroup.js";

import { setOrganizerTokenAndCookies } from "../../Middlewares/jwtAuth.js";
import generateSecureOTP from "../../Config/getOTP.js";

import transporter from "../../Config/nodemailer.js";

import { marked } from "marked";

const signUp = async (req, res) => {
  try {
    const { fullName, email, password, organizationName, phone } = req.body;

    if (!fullName || !email || !password || !organizationName || !phone) {
      return res.json({ success: false, message: `All Fields Are Mandatory` });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: `Please Provide The Proper Mail`,
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: `Password Must be minimum of length 8`,
      });
    }

    const organizerExists = await Organizer.findOne({ email });

    if (organizerExists && organizerExists.isAccountVerified) {
      return res.json({
        success: false,
        message: `Organizer With Provided Mail Already Exists`,
      });
    }

    const saltRound = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, saltRound);

    // setUserTokenAndCookie(newUser,res);

    // console.log("New User Created SUccessfully",newUser);

    const { OTP, hashedOTP, expiredAt } = await generateSecureOTP();

    let newUser = "";
    let updatedUser = "";

    if (!organizerExists) {
      newUser = await Organizer.create({
        fullName,
        email,
        organizationName,
        phone,
        password: hashedPassword,
        verifyOtp: hashedOTP,
        verifyOtpExpiredAt: expiredAt,
        clusterId: null, // Will be set to their own ID after creation
        role: "owner", // Owner of their own organization
      });

      // Set clusterId to the user's own ID for the main organization
      newUser.clusterId = newUser._id;
      // Set themselves as the current organization context
      newUser.currentOrganizationContext = newUser._id;
      await newUser.save();
    } else {
      updatedUser = await Organizer.findOneAndUpdate(
        { email },
        {
          $set: {
            fullName,
            email,
            organizationName,
            phone,
            password: hashedPassword,
            verifyOtp: hashedOTP,
            verifyOtpExpiredAt: expiredAt,
          },
        },
        { new: true }
      );

      // Set clusterId to their own ID if not already set
      if (!updatedUser.clusterId) {
        updatedUser.clusterId = updatedUser._id;
        updatedUser.role = "owner";
        updatedUser.currentOrganizationContext = updatedUser._id;
        await updatedUser.save();
      }
    }

    try {
      const mailOption = {
        from: `Tourney 24 <${process.env.SENDER_EMAIL_SMT}>`,
        to: email,
        subject: `Welcom To Tourney 24`,
        html: `
                  <h1> Hello ${fullName}</h1>
                  <h2>We Heartly Welcome You as Organizer in Tourney 24 </h2>
                  <p>Enter the OTP  <b> ${OTP} </b> To Create Account With The Provided email: <strong>${email}</strong></p>
                  <p>Enjoy your experience 💖</p>
                  
                `,
      };

      const info = await transporter.sendMail(mailOption);
      console.log(
        `Mail Has been Sent With The message id :- ${info}, ${info.messageId}`
      );
    } catch (error) {
      console.log(`Error while Generating the mail ${error}, ${error.message}`);
      return res.json({
        success: false,
        message: "Error In Sending OTP to Organizer's Email",
      });
    }

    res.json({ success: true, message: `OTP Has Been Sent SuccessFully` });
  } catch (error) {
    console.log(`Error In Signup End-Point of (Organizer) ${error}`);
    res.json({ success: false, message: `Error In Signup End Point ${error}` });
  }
};

const verifyEmailWithOTP = async (req, res) => {
  try {
    const { OTP, organizerMail } = req.body;

    console.log(req.body);

    if (!OTP) {
      return res.json({ sucess: false, message: "Enter the OTP" });
    }

    const organizer = await Organizer.findOne({ email: organizerMail });
    console.log(organizer);
    if (!organizer) {
      return res.json({ success: false, message: "Email Not Found" });
    }

    console.log(organizer);

    if (organizer.verifyOtp == "") {
      return res.json({ success: false, message: `OTP Is Not Found` });
    }

    const isOTPVerified = await bcrypt.compare(
      String(OTP),
      organizer.verifyOtp
    );

    if (organizer.verifyOtp == "" || !isOTPVerified) {
      return res.json({ success: false, message: `Invalid OTP` });
    }

    if (organizer.verifyOtpExpiredAt < Date.now()) {
      return res.json({ success: false, message: `OTP Has Been Expired` });
    }

    const newOrganizer = await Organizer.findOneAndUpdate(
      { email: organizerMail },
      {
        $set: {
          isAccountVerified: true,
          verifyOtp: "",
          verifyOtpExpiredAt: 0,
        },
      },
      { new: true }
    );

    setOrganizerTokenAndCookies(newOrganizer, res);

    return res.json({
      success: true,
      message: `Account Has Been Created And Verified Succcessfully, Start Creating the Tournaments`,
    });
  } catch (error) {
    console.log(`Error in the verify OTP (BackEnd) ${error}`);
    return res.json({
      success: false,
      message: `Error in the verify OTP (BackEnd) ${error}`,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: true,
        message: `All Mentioned Fields Are Mandatory To Login`,
      });
    }

    const organizer = await Organizer.findOne({ email });

    if (!organizer) {
      return res.json({
        success: false,
        message: `Organizer With the Provided Mail Doesn't Exist `,
      });
    }

    if (!organizer.isAccountVerified) {
      return res.json({
        succes: false,
        message: `Organizer With the Provided Mail Doesn't Exist, Please Sign Up to continue`,
      });
    }

    const isPassWordCorrect = await bcrypt.compare(
      password,
      organizer.password
    );

    if (!isPassWordCorrect) {
      return res.json({
        success: false,
        message: `Incorrect PassWord, Please Try Again`,
      });
    }

    setOrganizerTokenAndCookies(organizer, res);

    return res.json({
      success: true,
      message: `Organizer Logged In SuccessFully`,
    });
  } catch (error) {
    console.log(`Error in Login End Point of Organizer ${error}`);
    res.json({ success: false, message: `Error In Login End Point ${error}` });
  }
};

const checkOrganizerAuthorization = async (req, res) => {
  try {
    return res.json({ success: true, message: `Organizer is Authorised` });
  } catch (error) {
    console.log(`Error In CHecking Organizer Authorisation End Point ${error}`);
    res.json({
      success: false,
      message: `Error In Checking Organizer Authorization Rotue, ${error}`,
    });
  }
};

const getCurrentOrganizer = async (req, res) => {
  try {
    const organizerId = req.organizer;
    // console.log(userId);
    if (!organizerId) {
      return res.json({
        success: false,
        message: `Organizer is Not Authorized`,
      });
    }

    const organizer = await Organizer.findById(organizerId).select([
      "-password",
    ]);

    if (!organizer) {
      return res.json({ success: false, message: `Organizer Doesn't Exist ` });
    }

    return res.json({ success: true, message: organizer });
  } catch (error) {
    console.log(`Error In Getting Organizer Data End Point ${error}`);
    res.json({
      success: false,
      message: `Error In Getting Organizer Data End Point, ${error}`,
    });
  }
};

const logOut = async (req, res) => {
  try {
    res.clearCookie("JWT_Organizer", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "development" ? "strict" : "none",
    });

    return res.json({
      success: true,
      message: `Organizer Logged Out Success Fully`,
    });
  } catch (error) {
    console.log(`Error In LogOut of Organizer End Point ${error}`);
    res.json({
      success: false,
      message: `Error In LogOut of Organizer End Point, ${error}`,
    });
  }
};

const createTournament = async (req, res) => {
  try {
    const organization = req.organizer;
    console.log(
      "[DEBUG] Active organization in context:",
      organization,
      "| Logged-in user:",
      req.organizerUser
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Session Ended Sign In Again Please",
      });
    }

    const organizer = await Organizer.findById(organization);

    if (!organizer) {
      return res.json({ success: false, message: "Organizer Not Found" });
    }

    const {
      tournamentName,
      tournamentType,
      sport,
      description,
      coverImage,
      startDate,
      endDate,
      location,
    } = req.body;

    if (
      !tournamentName ||
      !description ||
      !coverImage ||
      !startDate ||
      !endDate ||
      !location ||
      !tournamentType ||
      !sport
    ) {
      return res.json({ success: false, message: "All Fields are Mandatory" });
    }

    const image = await cloudinary.uploader.upload(coverImage);

    const uploadURL = image.secure_url;

    const defaultSettings = {
      url: null,
      otp: "983620",
      seedingOptionInFixtures: false,
      askEmailFromPlayer: true,
      askMobileFromPlayer: true,
      askAdditionalInfo: true,
      showFixtures: true,
      customFields: [
        {
          fieldName: "Name",
          hintText: "",
          isMandatory: true,
          displayInFixture: false,
        },
        {
          fieldName: "Email",
          hintText: "",
          isMandatory: true,
          displayInFixture: false,
        },
        {
          fieldName: "Phone",
          hintText: "",
          isMandatory: true,
          displayInFixture: false,
        },
        {
          fieldName: "T-Shirt",
          hintText: "T-Shirt Size",
          isMandatory: false,
          displayInFixture: false,
        },
        {
          fieldName: "Academy Name",
          hintText: "Enter your Academy Name",
          isMandatory: false,
          displayInFixture: false,
        },
      ],
    };

    const tournament = await Tournament.create({
      name: tournamentName,
      type: tournamentType,
      sport,
      description,
      coverImage: uploadURL,
      startDate,
      endDate,
      location,
      organization,
      settings: defaultSettings,
    });

    // console.log(tournament);

    await Organizer.findByIdAndUpdate(organization, {
      $push: {
        tournament: tournament._id,
      },
    });

    return res.json({
      success: true,
      message: "Tournament Created SuccessFully",
    });
  } catch (error) {
    console.log(
      `Error In Creating Tournament in Organizer Controller ${error}`
    );
    return res.json({
      success: false,
      message: "Error In Creating Tournament in Organizer Controller",
    });
  }
};

const getAllTournaments = async (req, res) => {
  try {
    const organization = req.organizer;
    console.log(
      "[DEBUG] Active organization in context:",
      organization,
      "| Logged-in user:",
      req.organizerUser
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Session Ended Sign In Again Please",
      });
    }

    const organizer = await Organizer.findById(organization);

    if (!organizer) {
      return res.json({ success: false, message: "Organizer Not Found" });
    }

    const tournaments = await Tournament.find({ organization });

    return res.json({ success: true, message: tournaments });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error In Creating Tournament in Organizer Controller",
    });
  }
};

const getParticularTournament = async (req, res) => {
  try {
    const organization = req.organizer;
    console.log(
      "[DEBUG] Active organization in context:",
      organization,
      "| Logged-in user:",
      req.organizerUser
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Session Ended Sign In Again Please",
      });
    }

    const organizer = await Organizer.findById(organization);

    if (!organizer) {
      return res.json({ success: false, message: "Organizer Not Found" });
    }

    const { id } = req.params;
    // console.log(id);

    const tournament = await Tournament.findById(id); // Pass the Tournament Id in parameter in Route

    if (!tournament) {
      return res.json({ success: false, message: "Tournament Not Found" });
    }

    // const tournamentDetails = await Tournament.findById(req.params.tournamentId).populate('events').populate('teams');
    return res.json({ success: true, message: tournament });
  } catch (error) {
    console.log(`Error In Getting Particular Tournament ${error}`);
    return res.json({
      success: false,
      message: "Error In Getting Particular Tournament",
    });
  }
};

const getDashBoardData = async (req, res) => {
  try {
    const organization = req.organizer;
    console.log(
      "[DEBUG] Active organization in context:",
      organization,
      "| Logged-in user:",
      req.organizerUser
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Session Ended. Sign In Again Please.",
      });
    }

    // Get organizer
    const organizer = await Organizer.findById(organization);

    if (!organizer) {
      return res.json({ success: false, message: "Organizer Not Found" });
    }

    // 1. Total Tournaments
    const tournaments = await Tournament.find({ organization });

    // 2. Total Events
    // Get all event ids from all tournaments
    const allEventIds = tournaments.reduce((arr, t) => {
      if (t.events && t.events.length > 0) {
        arr.push(...t.events);
      }
      return arr;
    }, []);
    const totalEvents = allEventIds.length;

    // 3. Total Participants (individual + group)
    let totalParticipants = 0;
    for (const t of tournaments) {
      if (t.participantsIndividual)
        totalParticipants += t.participantsIndividual.length;
      if (t.participantsGroup) totalParticipants += t.participantsGroup.length;
    }

    // 4. Total Members (memberAccess array in Organizer)
    const totalMembers = organizer.memberAccess
      ? organizer.memberAccess.length
      : 0;

    return res.json({
      success: true,
      dashboard_data: {
        totalTournaments: tournaments.length,
        totalEvents,
        totalParticipants,
        totalMembers,
      },
    });
  } catch (error) {
    console.log(`Error In Getting Dashboard Data for Organizer ${error}`);
    return res.json({
      success: false,
      message: `Error In Getting Dashboard Data for Organizer ${error}`,
    });
  }
};

const createNewEvent = async (req, res) => {
  try {
    const organization = req.organizer;
    console.log(
      "[DEBUG] Active organization in context:",
      organization,
      "| Logged-in user:",
      req.organizerUser
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Session Ended Sign In Again Please",
      });
    }

    const organizer = await Organizer.findById(organization);

    if (!organizer) {
      return res.json({ success: false, message: "Organizer Not Found" });
    }

    const { id } = req.params;
    // console.log(id);

    const tournament = await Tournament.findById(id); // Pass the Tournament Id in parameter in Route

    if (!tournament) {
      return res.json({ success: false, message: "Tournament Not Found" });
    }

    const {
      allowBooking,
      eventName,
      eventType,
      eventType2,
      matchType,
      maxTeams,
      teamEntryFee,
    } = req.body;

    if (
      !eventName ||
      !eventType ||
      !matchType ||
      !maxTeams ||
      !teamEntryFee ||
      !eventType2
    ) {
      return res.json({
        success: false,
        message: "All Fields are mandatory to Fill",
      });
    }

    const newEvent = await Events.create({
      name: eventName,
      tournament: id,
      eventType,
      eventType2,
      matchType,
      maxTeams,
      entryFee: teamEntryFee,
      allowBooking,
      // numberOfParticipants
    });

    tournament.events.push(newEvent._id);
    await tournament.save();

    organizer.events.push(newEvent._id);
    await organizer.save();

    return res.json({
      success: true,
      message: "New Event Created SuccessFully",
    });
  } catch (error) {
    console.log(`Error In Creating New Event ${error}`);
    return res.json({ success: false, message: "Error In Creating New Event" });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const organization = req.organizer;
    console.log(
      "[DEBUG] Active organization in context:",
      organization,
      "| Logged-in user:",
      req.organizerUser
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Session Ended Sign In Again Please",
      });
    }

    const organizer = await Organizer.findById(organization);

    if (!organizer) {
      return res.json({ success: false, message: "Organizer Not Found" });
    }

    const { TournamentId } = req.params;
    // console.log(id);

    const tournament = await Tournament.findById(TournamentId); // Pass the Tournament Id in parameter in Route

    if (!tournament) {
      return res.json({ success: false, message: "Tournament Not Found" });
    }

    const allEvents = await Events.find({
      tournament: TournamentId,
    });

    return res.json({ success: true, message: allEvents });
  } catch (error) {
    console.log(`Error In Gettinga All Event ${error}`);
    return res.json({ success: false, message: "Error In Gettinga All Event" });
  }
};

const createIndividual = async (req, res) => {
  try {
    const organization = req.organizer;
    console.log(
      "[DEBUG] Active organization in context:",
      organization,
      "| Logged-in user:",
      req.organizerUser
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Session Ended Sign In Again Please",
      });
    }

    const organizer = await Organizer.findById(organization);

    if (!organizer) {
      return res.json({ success: false, message: "Organizer Not Found" });
    }

    const { TournamentId, eventId } = req.params;

    if (!TournamentId || !eventId) {
      return res.json({
        success: false,
        message: `Tournament and Event Id's are mandatory for Creating Players `,
      });
    }

    const tournament = await Tournament.findById(TournamentId);
    const event = await Events.findById(eventId);

    if (!tournament || !event) {
      return res.json({
        success: false,
        message: `Tournament (Event) Not Found`,
      });
    }

    // console.log(req.body);

    const { name, email, mobile, academyName, feesPaid, ...customFields } =
      req.body;

    if (!name || !email || !mobile || !academyName) {
      return res.json({
        success: false,
        message: `All Fields are mandatory to Fill`,
      });
    }

    const check = await PlayerModel.findOne({ email });
    if (!check) {
      return res.json({
        success: false,
        message: `${email} is Not Registered in Tourney24`,
      });
    }

    const newIndividual = await TeamIndividual.create({
      name,
      email,
      mobile,
      academyName,
      feesPaid,
      tournamentId: TournamentId,
      event: event.name,
      eventId,
      player: check._id,
      dateAndTime: new Date().toISOString(),
      customFields:
        Object.keys(customFields).length > 0 ? customFields : undefined,
    });

    tournament.participantsIndividual.push(newIndividual._id);
    await tournament.save();

    organizer.participantsIndividual.push(newIndividual._id);
    await organizer.save();

    event.participantsIndividual.push(newIndividual._id);
    await event.save();

    return res.json({
      success: true,
      message: "Individual Team Registered SuccessFully",
    });
  } catch (error) {
    console.log("Error in Creating Indiviudal group ", error);
    return res.json({
      success: false,
      message: "Error in Creating Player (Individual)",
    });
  }
};

const createGroupTeam = async (req, res) => {
  try {
    const organization = req.organizer;
    console.log(
      "[DEBUG] Active organization in context:",
      organization,
      "| Logged-in user:",
      req.organizerUser
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Session Ended Sign In Again Please",
      });
    }

    const organizer = await Organizer.findById(organization);

    if (!organizer) {
      return res.json({ success: false, message: "Organizer Not Found" });
    }

    const { TournamentId, eventId } = req.params;

    if (!TournamentId || !eventId) {
      return res.json({
        success: false,
        message: `Tournament and Event Id's are mandatory for Creating Players `,
      });
    }

    const tournament = await Tournament.findById(TournamentId);
    const event = await Events.findById(eventId);

    if (!tournament || !event) {
      return res.json({
        success: false,
        message: `Tournament (Event) Not Found`,
      });
    }

    // console.log(req.body);

    const { teamName, members } = req.body;

    if (!teamName || !members) {
      return res.json({ success: false, message: `All Fields are mandatory` });
    }
    let FinalMembers = [];
    // members.forEach(async (member)=>{
    //     const { name, email, mobile, academyName, feesPaid } = member;
    //     if(!name || !email || !mobile || !academyName){
    //         return res.json({success:false,message:`All Fields are mandatory to Fill`});
    //     }
    //     const check = await PlayerModel.findOne({email});
    //     if(!check){
    //         return res.json({success:false,message:`${email} is Not Registered in Tourney24`});
    //     }
    //     const memberDetails = {
    //         player:check._id,
    //         name,
    //         email,
    //         mobile,
    //         academyName,
    //         feesPaid,
    //     }
    //     FinalMembers.push(memberDetails);
    // })

    for (const member of members) {
      const { name, email, mobile, academyName, feesPaid } = member;

      if (!name || !email || !mobile || !academyName) {
        return res.json({
          success: false,
          message: `All Fields are mandatory to Fill`,
        });
      }

      const check = await PlayerModel.findOne({ email });
      if (!check) {
        return res.json({
          success: false,
          message: `${email} is Not Registered in Tourney24`,
        });
      }

      FinalMembers.push({
        player: check._id,
        name,
        email,
        mobile,
        academyName,
        feesPaid,
        customFields: member.customFields || {},
      });
    }

    if (FinalMembers.length === 0) {
      return res.json({
        success: false,
        message:
          "No valid Registered players (In Tourney 24) found in the team",
      });
    }

    const newTeam = await TeamGroup.create({
      teamName,
      members: FinalMembers,
      entry: "offline",
      event: event.name,
      eventId,
      tournamentId: TournamentId,
      dateAndTime: new Date().toISOString(),
    });

    tournament.participantsGroup.push(newTeam._id);
    await tournament.save();

    organizer.participantsGroup.push(newTeam._id);
    await organizer.save();

    event.participantsGroup.push(newTeam._id);
    await event.save();

    return res.json({
      success: true,
      message: "New Team Created Successfully",
    });
  } catch (error) {
    console.log("Error in Creating group Team ", error);
    return res.json({
      success: false,
      message: "Error in Creating Players (Group)",
    });
  }
};

const getIndividualTeam = async (req, res) => {
  try {
    const organization = req.organizer;
    console.log(
      "[DEBUG] Active organization in context:",
      organization,
      "| Logged-in user:",
      req.organizerUser
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Session Ended Sign In Again Please",
      });
    }

    const organizer = await Organizer.findById(organization);

    if (!organizer) {
      return res.json({ success: false, message: "Organizer Not Found" });
    }

    const { TournamentId, eventId } = req.params;

    if (!TournamentId || !eventId) {
      return res.json({
        success: false,
        message: `Tournament and Event Id's are mandatory for Creating Players `,
      });
    }

    const tournament = await Tournament.findById(TournamentId);
    const event = await Events.findById(eventId);

    if (!tournament || !event) {
      return res.json({
        success: false,
        message: `Tournament (Event) Not Found`,
      });
    }

    const teams = await TeamIndividual.find({
      tournamentId: TournamentId,
      eventId: eventId,
    });

    return res.json({ success: true, message: teams });
  } catch (error) {
    console.log("Error in Getting Individual Team ", error);
    return res.json({
      success: false,
      message: `Error in Getting Individual Team ${error}`,
    });
  }
};

const getGroupTeam = async (req, res) => {
  try {
    const organization = req.organizer;
    console.log(
      "[DEBUG] Active organization in context:",
      organization,
      "| Logged-in user:",
      req.organizerUser
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Session Ended Sign In Again Please",
      });
    }

    const organizer = await Organizer.findById(organization);

    if (!organizer) {
      return res.json({ success: false, message: "Organizer Not Found" });
    }

    const { TournamentId, eventId } = req.params;

    if (!TournamentId || !eventId) {
      return res.json({
        success: false,
        message: `Tournament and Event Id's are mandatory for Creating Players `,
      });
    }

    const tournament = await Tournament.findById(TournamentId);
    const event = await Events.findById(eventId);

    if (!tournament || !event) {
      return res.json({
        success: false,
        message: `Tournament (Event) Not Found`,
      });
    }

    const teams = await TeamGroup.find({
      tournamentId: TournamentId,
      eventId: eventId,
    });

    return res.json({ success: true, message: teams });
  } catch (error) {
    console.log("Error in Getting Group Team ", error);
    return res.json({
      success: false,
      message: `Error in Getting Group Team ${error}`,
    });
  }
};

const getPaymentDetails = async (req, res) => {
  try {
    const organization = req.organizer;
    console.log(
      "[DEBUG] Active organization in context:",
      organization,
      "| Logged-in user:",
      req.organizerUser
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Session Ended Sign In Again Please",
      });
    }

    const organizer = await Organizer.findById(organization);

    if (!organizer) {
      return res.json({ success: false, message: "Organizer Not Found" });
    }

    const { TournamentId } = req.params;

    if (!TournamentId) {
      return res.json({
        success: false,
        message: `Tournament Id is mandatory for Getting Payment Details `,
      });
    }

    const tournament = await Tournament.findById(TournamentId);

    if (!tournament) {
      return res.json({ success: false, message: `Tournament Not Found` });
    }

    const paymentsIndividual = await TeamIndividual.find({
      tournamentId: TournamentId,
    }).populate("eventId");

    const paymentsGroup = await TeamGroup.find({
      tournamentId: TournamentId,
    }).populate("eventId");

    return res.json({ success: true, paymentsIndividual, paymentsGroup });
  } catch (error) {
    console.log(`Error In Getting Payment Details ${error}`);
    return res.json({
      success: false,
      message: `Error In Getting Payment Details ${error}`,
    });
  }
};

const addSettings = async (req, res) => {
  try {
    const organization = req.organizer;
    console.log(
      "[DEBUG] Active organization in context:",
      organization,
      "| Logged-in user:",
      req.organizerUser
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Session Ended Sign In Again Please",
      });
    }

    const organizer = await Organizer.findById(organization);

    if (!organizer) {
      return res.json({ success: false, message: "Organizer Not Found" });
    }

    const { TournamentId } = req.params;
    // console.log(id);

    const tournament = await Tournament.findById(TournamentId); // Pass the Tournament Id in parameter in Route

    if (!tournament) {
      return res.json({ success: false, message: "Tournament Not Found" });
    }

    const {
      askAdditionalInfo,
      askEmailFromPlayer,
      askMobileFromPlayer,
      showFixtures,
      seedingOptionInFixtures,
      customFields,
      tournamentUrl,
    } = req.body;
    // console.log(id);

    tournament.settings = {
      askAdditionalInfo,
      askEmailFromPlayer,
      askMobileFromPlayer,
      showFixtures,
      seedingOptionInFixtures,
      customFields,
      tournamentUrl,
    };

    await tournament.save();

    return res.json({ success: true, message: "Settings Added SuccessFully " });
  } catch (error) {
    console.log(`Error in Adding Settings ${error}`);
    return res.json({
      success: false,
      message: `Error in Adding Settings Details ${error}`,
    });
  }
};

const sendMassMail = async (req, res) => {
  try {
    const organization = req.organizer;
    console.log(
      "[DEBUG] Active organization in context:",
      organization,
      "| Logged-in user:",
      req.organizerUser
    );

    if (!organization) {
      return res.json({
        success: false,
        message: "Session Ended Sign In Again Please",
      });
    }

    const organizer = await Organizer.findById(organization);
    if (!organizer) {
      return res.json({ success: false, message: "Organizer Not Found" });
    }

    const { TournamentId } = req.params;
    const tournament = await Tournament.findById(TournamentId);
    if (!tournament) {
      return res.json({ success: false, message: "Tournament Not Found" });
    }

    const { toAddresses, subject, content } = req.body;

    if (!toAddresses || !subject || !content) {
      return res.json({
        success: false,
        message: `All Fields are mandatory to Fill`,
      });
    }

    // Ensure toAddresses is an array
    const recipients = Array.isArray(toAddresses)
      ? toAddresses
      : typeof toAddresses === "string"
      ? toAddresses
          .split(",")
          .map((addr) => addr.trim())
          .filter(Boolean)
      : [];

    if (recipients.length === 0) {
      return res.json({
        success: false,
        message: "No valid recipients provided.",
      });
    }

    // You can use BCC for mass mailing, or send individually
    // Here we send individually for better deliverability & logging
    let successCount = 0;
    let failCount = 0;
    let failedEmails = [];

    const htmlContent = marked.parse(content);

    for (const email of recipients) {
      try {
        const mailOption = {
          from: `Tourney 24 <${process.env.SENDER_EMAIL_SMT}>`,
          to: email,
          subject: subject,
          html: htmlContent,
        };

        const info = await transporter.sendMail(mailOption);
        // console.log(`Mail sent to ${email} with messageId: ${info.messageId}`);
        successCount++;
      } catch (err) {
        console.log(`Error sending to ${email}:`, err.message);
        failCount++;
        failedEmails.push(email);
      }
    }

    return res.json({
      success: true,
      message: `Mail process complete. Sent: ${successCount}, Failed: ${failCount}`,
      failedEmails,
    });
  } catch (error) {
    console.log(`Error in sendMassMail: ${error}`);
    return res.json({
      success: false,
      message: `Error in Sending Mails: ${error}`,
    });
  }
};

const updateTournamentStatus = async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    const now = new Date();

    // Helper to get date part only (year, month, day)
    const getDateOnly = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

    let updated = [];

    for (const tournament of tournaments) {
      if (tournament.status === "cancelled") continue;

      let newStatus = tournament.status;
      const nowDate = getDateOnly(now);
      const startDate = getDateOnly(tournament.startDate);
      const endDate = getDateOnly(tournament.endDate);

      if (nowDate < startDate) {
        newStatus = "Upcoming";
      } else if (nowDate >= startDate && nowDate <= endDate) {
        newStatus = "Active";
      } else if (nowDate > endDate) {
        newStatus = "Completed";
      }

      if (tournament.status !== newStatus) {
        tournament.status = newStatus;
        await tournament.save();
        updated.push({ id: tournament._id, name: tournament.name, newStatus });
      }
    }

    return res.json({
      success: true,
      message: `Tournament statuses updated.`,
      updatedTournaments: updated,
    });
  } catch (error) {
    console.log(`Error In Updating Tournament Status ${error}`);
    return res.json({
      success: false,
      message: `Error In Updating Tournament Status ${error}`,
    });
  }
};
// Get organizer profile
const getProfile = async (req, res) => {
  try {
    const organizerId = req.organizer;

    if (!organizerId) {
      return res.json({
        success: false,
        message: "Session ended, please sign in again",
      });
    }

    const organizer = await Organizer.findById(organizerId).select(
      "-password -verifyOtp"
    );

    if (!organizer) {
      return res.json({ success: false, message: "Organizer not found" });
    }

    return res.json({
      success: true,
      organizer: organizer,
      message: "Profile fetched successfully",
    });
  } catch (error) {
    console.log(`Error in getProfile: ${error}`);
    return res.json({ success: false, message: "Error fetching profile" });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const organizerId = req.organizer;

    if (!organizerId) {
      return res.json({
        success: false,
        message: "Session ended, please sign in again",
      });
    }

    // Get organizer details
    const organizer = await Organizer.findById(organizerId);
    if (!organizer) {
      return res.json({ success: false, message: "Organizer not found" });
    }

    // Get tournaments count and data
    const tournaments = await Tournament.find({ organization: organizerId });
    const totalTournaments = tournaments.length;

    // Calculate active tournaments (upcoming and active status)
    const activeTournaments = tournaments.filter(
      (t) => t.status === "upcoming" || t.status === "active"
    ).length;

    // Calculate completed tournaments
    const completedTournaments = tournaments.filter(
      (t) => t.status === "completed"
    ).length;

    // Calculate total participants across all tournaments
    const totalParticipants = tournaments.reduce((sum, tournament) => {
      return sum + (tournament.totalPlayers || 0);
    }, 0);

    // Get recent tournaments (last 5)
    const recentTournaments = tournaments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    const stats = {
      totalTournaments,
      activeTournaments,
      completedTournaments,
      totalParticipants,
      recentTournaments: recentTournaments.map((t) => ({
        _id: t._id,
        name: t.name,
        status: t.status,
        startDate: t.startDate,
        endDate: t.endDate,
        location: t.location,
        totalPlayers: t.totalPlayers || 0,
        createdAt: t.createdAt,
      })),
    };

    return res.json({
      success: true,
      stats,
      message: "Dashboard stats fetched successfully",
    });
  } catch (error) {
    console.log(`Error in getDashboardStats: ${error}`);
    return res.json({
      success: false,
      message: "Error fetching dashboard statistics",
    });
  }
};

// Add member to organization cluster
const addMember = async (req, res) => {
  try {
    const organizerId = req.organizer;
    const { email, password } = req.body;

    console.log("addMember called by organizerId:", organizerId);
    console.log("Adding member email:", email);

    if (!organizerId) {
      return res.json({
        success: false,
        message: "Session ended, please sign in again",
      });
    }

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if organizer exists
    const organizer = await Organizer.findById(organizerId);
    if (!organizer) {
      return res.json({ success: false, message: "Organizer not found" });
    }

    // Check if member already exists with verified account
    let existingMember = await Organizer.findOne({
      email,
      isAccountVerified: true,
    });
    if (existingMember) {
      // Check if member is already in the same cluster
      if (
        existingMember.clusterId &&
        existingMember.clusterId.toString() === organizer.clusterId.toString()
      ) {
        return res.json({
          success: false,
          message: "Member is already part of this organization cluster",
        });
      }

      // Add existing member to the cluster
      existingMember.clusterId = organizer.clusterId;
      existingMember.addedBy = organizerId;
      existingMember.role = "member";
      await existingMember.save();

      return res.json({
        success: true,
        message: "Existing member added to organization cluster successfully",
        member: {
          _id: existingMember._id,
          email: existingMember.email,
          organizationName: existingMember.organizationName || "Not set",
          role: "member",
          addedAt: new Date(),
        },
      });
    }

    // Create new member account
    const saltRound = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, saltRound);

    const newMember = await Organizer.create({
      fullName: "", // Empty initially, can be updated later
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isAccountVerified: true, // Auto-verify members added by organization
      clusterId: organizer.clusterId, // Add to same cluster
      organizationName: "", // Empty initially
      phone: "", // Empty initially
      role: "member", // Set as member
      addedBy: organizerId, // Track who added this member
    });

    return res.json({
      success: true,
      message: "Member added to organization cluster successfully",
      member: {
        _id: newMember._id,
        email: newMember.email,
        organizationName: newMember.organizationName || "Not set",
        role: "member",
        addedAt: new Date(),
      },
    });
  } catch (error) {
    console.log(`Error in addMember: ${error}`);
    return res.json({ success: false, message: "Error adding member" });
  }
};

// Get all cluster members
const getOrganizationMembers = async (req, res) => {
  try {
    const organizerId = req.organizer;

    console.log("getOrganizationMembers called by organizerId:", organizerId);

    if (!organizerId) {
      return res.json({
        success: false,
        message: "Session ended, please sign in again",
      });
    }

    const organizer = await Organizer.findById(organizerId);
    if (!organizer) {
      return res.json({ success: false, message: "Organizer not found" });
    }

    console.log("Organizer details:", {
      email: organizer.email,
      role: organizer.role,
      clusterId: organizer.clusterId,
    });

    // Find all members in the same cluster
    const clusterMembers = await Organizer.find({
      clusterId: organizer.clusterId,
      isAccountVerified: true,
    })
      .select("email phone organizationName role createdAt")
      .sort({ createdAt: 1 });

    // Map cluster members to response format
    const members = clusterMembers.map((member) => ({
      _id: member._id,
      email: member.email,
      organizationName: member.organizationName || "Not set",
      role: member.role || "member", // Use the stored role field
      status: "Active",
      isDefault: member._id.toString() === organizerId.toString(),
      addedAt: member.createdAt || new Date(),
    }));

    return res.json({
      success: true,
      members,
      message: "Members fetched successfully",
    });
  } catch (error) {
    console.log(`Error in getOrganizationMembers: ${error}`);
    return res.json({ success: false, message: "Error fetching members" });
  }
};

// Get organizations in the same cluster
const getAccessibleOrganizations = async (req, res) => {
  try {
    const userId = req.organizerUser; // use base account id

    if (!userId) {
      return res.json({
        success: false,
        message: "Session ended, please sign in again",
      });
    }

    const user = await Organizer.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Find all organizations in the same cluster
    const clusterOrganizations = await Organizer.find({
      clusterId: user.clusterId,
      isAccountVerified: true,
    }).select(
      "_id email organizationName phone role currentOrganizationContext"
    );

    // Filter organizations - only show organizations with names
    const filteredOrganizations = clusterOrganizations.filter((org) => {
      return org.organizationName && org.organizationName.trim() !== "";
    });

    const organizations = filteredOrganizations.map((org) => ({
      _id: org._id,
      name: org.organizationName,
      email: org.email,
      phone: org.phone || "",
      role: org._id.toString() === userId.toString() ? "owner" : "accessible",
      isActive: user.currentOrganizationContext
        ? org._id.toString() === user.currentOrganizationContext.toString()
        : org._id.toString() === userId.toString(),
    }));

    return res.json({
      success: true,
      organizations,
      message: "Organizations fetched successfully",
    });
  } catch (error) {
    console.log(`Error in getAccessibleOrganizations: ${error}`);
    return res.json({
      success: false,
      message: "Error fetching organizations",
    });
  }
};

// Switch organization context within cluster
const switchOrganization = async (req, res) => {
  try {
    const userId = req.organizerUser; // use base account id
    const { organizationId } = req.body;

    if (!userId || !organizationId) {
      return res.json({ success: false, message: "Invalid request" });
    }

    const user = await Organizer.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Get the target organization
    const targetOrganization = await Organizer.findById(organizationId);
    if (!targetOrganization) {
      return res.json({ success: false, message: "Organization not found" });
    }

    // Check if both users are in the same cluster
    if (
      !user.clusterId ||
      !targetOrganization.clusterId ||
      user.clusterId.toString() !== targetOrganization.clusterId.toString()
    ) {
      return res.json({
        success: false,
        message: "Access denied to this organization",
      });
    }

    // Update the user's current organization context WITHOUT changing JWT token
    user.currentOrganizationContext = organizationId;
    await user.save();

    return res.json({
      success: true,
      message: "Organization switched successfully",
      organization: {
        _id: targetOrganization._id,
        name: targetOrganization.organizationName || targetOrganization.email,
        email: targetOrganization.email,
      },
    });
  } catch (error) {
    console.log(`Error in switchOrganization: ${error}`);
    return res.json({
      success: false,
      message: "Error switching organization",
    });
  }
};

// Create/Update current user's organization details within cluster
const createOrganization = async (req, res) => {
  try {
    const userId = req.organizerUser; // use base account id
    const { organizationName, organizationPhone } = req.body;

    console.log("createOrganization called by userId:", userId);
    console.log("Organization name to set:", organizationName);

    if (!userId) {
      return res.json({
        success: false,
        message: "Session ended, please sign in again",
      });
    }

    if (!organizationName || !organizationName.trim()) {
      return res.json({
        success: false,
        message: "Organization name is required",
      });
    }

    // Get the current user
    const user = await Organizer.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    console.log("User found:", {
      email: user.email,
      currentOrgName: user.organizationName,
      role: user.role,
    });

    // Promote member to owner (if not already) and update org details
    user.organizationName = organizationName.trim();
    user.phone = organizationPhone ? organizationPhone.trim() : "";
    // Promote to owner if previously member
    if (user.role !== "owner") {
      user.role = "owner";
    }
    // Make this new organization the active context immediately
    user.currentOrganizationContext = user._id;
    await user.save();

    console.log(
      "User updated successfully with new org name:",
      user.organizationName
    );

    return res.json({
      success: true,
      message: "Organization created successfully",
      organization: {
        _id: user._id,
        name: user.organizationName,
        email: user.email,
        phone: user.phone,
        createdAt: new Date(),
      },
    });
  } catch (error) {
    console.log(`Error in createOrganization: ${error}`);
    return res.json({ success: false, message: "Error creating organization" });
  }
};

// Get current organization info
const getCurrentOrganization = async (req, res) => {
  try {
    const user = await Organizer.findById(req.organizer).select(
      "currentOrganizationContext"
    );
    if (!user || !user.currentOrganizationContext) {
      return res.json({ success: false, message: "No organization selected" });
    }

    const org = await Organizer.findById(
      user.currentOrganizationContext
    ).select("organizationName phone email role addedAt country");
    if (!org) {
      return res.json({ success: false, message: "Organization not found" });
    }

    return res.json({ success: true, organization: org });
  } catch (error) {
    console.log("Error in getCurrentOrganization:", error);
    return res.json({ success: false, message: "Error fetching organization" });
  }
};

const getEventFixtures = async (req, res) => {
  try {

    const organization = req.organizer;

    if (!organization) {
      return res.json({
        success: false,
        message: "Session Ended Sign In Again Please",
      });
    }

    const organizer = await Organizer.findById(organization);

    if (!organizer) {
      return res.json({ success: false, message: "Organizer Not Found" });
    }


    const { eventId } = req.params;
    // Fetch the event to determine eventType
    const event = await Events.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    // Always use the raw ObjectId for teamA/teamB and check all three collections
    // const Team = (await import('../../Models/Organizer/Teams.js')).default;
    const TeamIndividual = (await import('../../Models/Organizer/TeamIndividual.js')).default;
    const TeamGroup = (await import('../../Models/Organizer/TeamGroup.js')).default;
 
    let rawFixtures = await Fixture.find({ event: eventId });
    let fixtures = await Promise.all(rawFixtures.map(async (fixture) => {
      let teamA = null, teamB = null;
      if (fixture.teamA) {       
        if (!teamA) {
          let ti = await TeamIndividual.findById(fixture.teamA);
          if (ti) teamA = { _id: ti._id, teamName: ti.name };
          else {
            let tg = await TeamGroup.findById(fixture.teamA);
            if (tg) teamA = { _id: tg._id, teamName: tg.teamName };
          }
        }
      } 
      if (fixture.teamB) {
        
        if (!teamB) {
          let ti = await TeamIndividual.findById(fixture.teamB);
          if (ti) teamB = { _id: ti._id, teamName: ti.name };
          else {
            let tg = await TeamGroup.findById(fixture.teamB);
            if (tg) teamB = { _id: tg._id, teamName: tg.teamName };
          }
        }
      }
      return {
        ...fixture.toObject(),
        teamA,
        teamB,
      };
    }));
    return res.json({ success: true, fixtures });
  } catch (error) {
    console.error('Error fetching fixtures:', error);
    return res.status(500).json({ success: false, message: 'Error fetching fixtures' });
  }
};






// Update fixture scores (PATCH)
const updateFixtureScores = async (req, res) => {
  try {
    const { fixtureId } = req.params;
    const { scoreA, scoreB } = req.body;

    // Validate input
    if (typeof scoreA !== 'number' || typeof scoreB !== 'number') {
      return res.status(400).json({ success: false, message: "Scores must be numbers." });
    }

    const fixture = await Fixture.findById(fixtureId);
    if (!fixture) {
      return res.status(404).json({ success: false, message: "Fixture not found." });
    }

    fixture.scoreA = scoreA;
    fixture.scoreB = scoreB;
    await fixture.save();

    return res.json({ success: true, message: "Scores updated successfully.", fixture });
  } catch (error) {
    console.error("Error updating fixture scores:", error);
    return res.status(500).json({ success: false, message: "Server error updating scores." });
  }
};

// Reset fixture scores (PATCH)
const resetFixtureScores = async (req, res) => {
  try {
    const { fixtureId } = req.params;

    const fixture = await Fixture.findById(fixtureId);
    if (!fixture) {
      return res.status(404).json({ success: false, message: "Fixture not found." });
    }

    fixture.scoreA = 0;
    fixture.scoreB = 0;
    await fixture.save();

    return res.json({ success: true, message: "Scores reset successfully.", fixture });
  } catch (error) {
    console.error("Error resetting fixture scores:", error);
    return res.status(500).json({ success: false, message: "Server error resetting scores." });
  }
};

export {
  signUp,
  verifyEmailWithOTP,
  login,
  createTournament,
  getAllTournaments,
  getParticularTournament,
  checkOrganizerAuthorization,
  getCurrentOrganizer,
  logOut,
  createNewEvent,
  getAllEvents,
  createIndividual,
  createGroupTeam,
  getIndividualTeam,
  getGroupTeam,
  getPaymentDetails,
  addSettings,
  sendMassMail,
  updateTournamentStatus,
  getDashBoardData,
  getProfile,
  getDashboardStats,
  addMember,
  getOrganizationMembers,
  getAccessibleOrganizations,
  switchOrganization,
  createOrganization,
  getCurrentOrganization,
  getEventFixtures,
  updateFixtureScores,
  resetFixtureScores,
};
