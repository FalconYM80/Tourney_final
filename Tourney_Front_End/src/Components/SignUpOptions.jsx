import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Trophy, User } from "lucide-react";
import { Link } from "react-router-dom";

const RoleSelection = () => {
  const roles = [
    {
      title: "Admin Login",
      description: "Manage tournaments, approve events, and platform operations",
      icon: Shield,
      path: "/login/admin",
      color: "bg-red-50 border-red-200 hover:bg-red-100"
    },
    {
      title: "Organizer Login", 
      description: "Create and manage tournaments, events, and participants",
      icon: Trophy,
      path: "/login/organizer",
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100"
    },
    {
      title: "Player Login",
      description: "Register for tournaments, view events, and track your progress",
      icon: User,
      path: "/login/player", 
      color: "bg-green-50 border-green-200 hover:bg-green-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to TournamentHub</h1>
          <p className="text-gray-600">Choose your role to continue</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card key={role.title} className={`${role.color} transition-all duration-200 cursor-pointer`}>
              <CardHeader className="text-center pb-4">
                <role.icon className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                <CardTitle className="text-xl">{role.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6 text-sm">{role.description}</p>
                <Link to={role.path}>
                  <Button className="w-full cursor-pointer bg-red-600">
                    Continue as {role.title.split(" ")[0]}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
{/* 
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/auth/signup-role" className="text-blue-600 hover:underline">
              Sign up here
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default RoleSelection;
