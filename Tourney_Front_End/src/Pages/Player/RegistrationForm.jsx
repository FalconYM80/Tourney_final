import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Plus, Trash2 } from "lucide-react";

const backend_URL = import.meta.env.VITE_BACKEND_URL;

const RegistrationForm = () => {
  const location = useLocation();
  const eventName = location.state?.eventName || "Event";
  const entryFee = location.state?.entryFee || 0;
  const TournamentId = location.state?.TournamentId;
  const eventId = location.state?.eventId;

  const [customFields, setCustomFields] = useState([]);
  const [members, setMembers] = useState([
    {
      name: "",
      mobile: "",
      email: "",
      academyName: "",
      customFieldValues: {}
    }
  ]);
  const [errors, setErrors] = useState([{}]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");

  // Fetch customFields from backend
  React.useEffect(() => {
    const fetchTournament = async () => {
      if (!TournamentId) return;
      try {
        const res = await fetch(`${backend_URL}/api/player/tournaments/${TournamentId}`);
        const data = await res.json();
        if (data.success && data.message?.settings?.customFields) {
          setCustomFields(data.message.settings.customFields);
          // Reinitialize members with new custom fields
          setMembers(members => members.map(member => ({
            ...member,
            customFieldValues: data.message.settings.customFields.reduce((acc, field) => {
              acc[field.fieldName] = member.customFieldValues?.[field.fieldName] || "";
              return acc;
            }, {})
          })));
        }
      } catch (err) {
        toast.error("Failed to load tournament custom fields");
      } finally {
        setLoading(false);
      }
    };
    fetchTournament();
    // eslint-disable-next-line
  }, [TournamentId]);

  const validate = () => {
    const newErrors = members.map(member => {
      const memberErrors = {};
      if (!member.name.trim()) memberErrors.name = "Name is required";
      if (!/^\d{10}$/.test(member.mobile)) memberErrors.mobile = "Enter a valid 10-digit mobile number";
      if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(member.email)) memberErrors.email = "Enter a valid email";
      if (!member.academyName.trim()) memberErrors.academyName = "Academy name is required";
      
      // Validate custom fields
      customFields.forEach(field => {
        if (field.isMandatory && !member.customFieldValues[field.fieldName]?.trim()) {
          memberErrors[field.fieldName] = `${field.fieldName} is required`;
        }
      });
      
      return memberErrors;
    });
    return newErrors;
  };

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const updatedMembers = [...members];
    
    // Check if this is a custom field
    if (customFields.some(field => field.fieldName === name)) {
      updatedMembers[index] = {
        ...updatedMembers[index],
        customFieldValues: {
          ...updatedMembers[index].customFieldValues,
          [name]: value
        }
      };
    } else {
      updatedMembers[index] = {
        ...updatedMembers[index],
        [name]: value
      };
    }
    
    setMembers(updatedMembers);
  };
  
  const addMember = () => {
    setMembers([...members, {
      name: "",
      mobile: "",
      email: "",
      academyName: "",
      // Initialize custom fields for the new member
      customFieldValues: customFields.reduce((acc, field) => {
        acc[field.fieldName] = "";
        return acc;
      }, {})
    }]);
    setErrors([...errors, {}]);
  };
  
  const removeMember = (index) => {
    if (members.length > 1) {
      const updatedMembers = [...members];
      updatedMembers.splice(index, 1);
      setMembers(updatedMembers);
      
      const updatedErrors = [...errors];
      updatedErrors.splice(index, 1);
      setErrors(updatedErrors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Full form validation before payment
    const validationErrors = validate();
    setErrors(validationErrors);
    const hasErrors = validationErrors.some(error => Object.keys(error).length > 0);
    if (hasErrors) {
      toast.error('Please fix all form errors before proceeding to payment.');
      return;
    }

    // Validate team name for group registration before payment
    if (members.length > 1 && (!teamName || !teamName.trim())) {
      toast.error('Team name is required for group registration.');
      return;
    }

    // Backend check: are all emails registered?
    try {
      const emailCheckRes = await fetch(`${backend_URL}/api/player/checkEmailsRegistered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: members.map(m => m.email) })
      });
      const emailCheckData = await emailCheckRes.json();
      if (!emailCheckData.success) {
        toast.error(emailCheckData.message || 'Some emails are not registered.');
        return;
      }
    } catch (err) {
      toast.error('Could not verify emails. Please try again.');
      return;
    }

    // Razorpay Payment Integration
    const amount = entryFee * members.length * 100; // Razorpay expects paise
    if (amount > 0) {
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      console.log('Razorpay Key:', import.meta.env.VITE_RAZORPAY_KEY_ID);
    const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use Vite env variable
        amount: amount,
        currency: 'INR',
        name: eventName,
        description: 'Tournament Registration',
        handler: async function (response) {
          // Only submit registration if payment is successful
          await submitRegistration();
        },
        prefill: {
          name: members[0]?.name || '',
          email: members[0]?.email || '',
          contact: members[0]?.mobile || ''
        },
        theme: { color: '#F37254' },
        modal: {
          ondismiss: function() {
            toast.error('Payment cancelled. Registration not submitted.');
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
      return;
    }

    // If no payment required, proceed as usual
    await submitRegistration();
  };

  // Registration API logic only
  const submitRegistration = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    
    const hasErrors = validationErrors.some(error => Object.keys(error).length > 0);
    if (hasErrors) return;

    if (!TournamentId || !eventId) {
      alert("Tournament or Event ID missing!");
      return;
    }

    let allSuccess = true;
    let errorMsg = '';

    if (members.length > 1) {
      // Group registration
      if (!teamName || !teamName.trim()) {
        toast.error("Team name is required for group registration.");
        return;
      }
      const membersPayload = members.map(member => ({
        name: member.name,
        email: member.email,
        mobile: member.mobile,
        academyName: member.academyName,
        feesPaid: false, // or true if you want to mark as paid
        customFields: member.customFieldValues // send as nested object for backend
      }));
      try {
        const res = await fetch(
          `${backend_URL}/api/organizer/createGroupTeam/${TournamentId}/${eventId}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamName, members: membersPayload, entry: 'online' }),
            credentials: 'include',
          }
        );
        const data = await res.json();
        if (!data.success) {
          allSuccess = false;
          errorMsg = data.message || 'Group registration failed.';
        }
      } catch (err) {
        allSuccess = false;
        errorMsg = err.message || 'Network error during group registration.';
      }
    } else {
      // Individual registration (keep previous logic)
      const member = members[0];
      const payload = {
        name: member.name,
        email: member.email,
        mobile: member.mobile,
        academyName: member.academyName,
        feesPaid: false, // or true if you want to mark as paid
        ...member.customFieldValues,
        entry: 'online'
      };
      try {
        const res = await fetch(
          `${backend_URL}/api/organizer/createIndividualTeam/${TournamentId}/${eventId}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            credentials: 'include',
          }
        );
        const data = await res.json();
        if (!data.success) {
          allSuccess = false;
          errorMsg = data.message || 'Registration failed.';
        }
      } catch (err) {
        allSuccess = false;
        errorMsg = err.message || 'Network error during registration.';
      }
    }

    if (allSuccess) {
      toast.success('Registration submitted successfully!');
      // Optionally, redirect or clear form
    } else {
      console.log("Error in registration:", errorMsg);
      toast.error(`Error: ${errorMsg}`);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <Navigation />
      <main className="flex-grow flex items-center justify-center pt-30 pb-12">
        <Card className="w-full max-w-2xl rounded-2xl shadow-lg p-0 mx-4">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-red-500 mb-6 text-center">
              Register for {eventName}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Team Name (for group registration) */}
              {members.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">
                    Team Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="teamName"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter team name"
                  />
                </div>
              )}

              {members.map((member, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-5 relative">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Member {index + 1}</h3>
                    {members.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => removeMember(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={member.name}
                        onChange={(e) => handleChange(index, e)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter name"
                      />
                      {errors[index]?.name && (
                        <p className="text-red-500 text-xs mt-1">{errors[index].name}</p>
                      )}
                    </div>
                    
                    {/* Mobile */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Mobile Number</label>
                      <input
                        type="tel"
                        name="mobile"
                        value={member.mobile}
                        onChange={(e) => handleChange(index, e)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                      />
                      {errors[index]?.mobile && (
                        <p className="text-red-500 text-xs mt-1">{errors[index].mobile}</p>
                      )}
                    </div>
                    
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={member.email}
                        onChange={(e) => handleChange(index, e)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="you@example.com"
                      />
                      {errors[index]?.email && (
                        <p className="text-red-500 text-xs mt-1">{errors[index].email}</p>
                      )}
                    </div>
                    
                    {/* Academy Name */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Academy Name</label>
                      <input
                        type="text"
                        name="academyName"
                        value={member.academyName}
                        onChange={(e) => handleChange(index, e)}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter academy name"
                      />
                      {errors[index]?.academyName && (
                        <p className="text-red-500 text-xs mt-1">{errors[index].academyName}</p>
                      )}
                    </div>

                    {/* Custom Fields */}
                    {customFields.map((field) => (
                      <div key={field.fieldName}>
                        <label className="block text-sm font-medium mb-1">
                          {field.fieldName}
                          {field.isMandatory && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        <input
                          type="text"
                          name={field.fieldName}
                          value={member.customFieldValues[field.fieldName] || ""}
                          onChange={(e) => handleChange(index, e)}
                          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder={field.hintText || `Enter ${field.fieldName}`}
                        />
                        {errors[index]?.[field.fieldName] && (
                          <p className="text-red-500 text-xs mt-1">{errors[index][field.fieldName]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Add Member Button */}
              <div className="flex justify-center">
                <Button 
                  type="button" 
                  onClick={addMember}
                  variant="outline"
                  className="border border-dashed border-gray-300 hover:border-red-500 text-gray-600 hover:text-red-500 rounded-lg px-4 py-2 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Member
                </Button>
              </div>
              
              {/* Entry Fee Display */}
              <div className="flex justify-between items-center bg-gray-100 px-4 py-3 rounded-lg">
                <span className="font-medium text-gray-700">Total Entry Fee</span>
                <span className="font-semibold text-red-500 text-lg">
                  ₹{(entryFee * members.length).toLocaleString()}
                </span>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-primary/90"
              >
                Submit Registration
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default RegistrationForm;
