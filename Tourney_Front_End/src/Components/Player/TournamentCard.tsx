import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { MapPin, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface TournamentCardProps {
  id: string | number;
  title: string;
  location: string;
  date: string;
  endDate?: string;
  ageGroups: string[];
  imageUrl: string;
  sport: string;
  description?: string;
}

const TournamentCard = ({ id, title, location, date, endDate, ageGroups, imageUrl, sport, description }: TournamentCardProps) => {
  console.log(id);
  return (
    <Link
      to={`/events/${id}`}
      state={{ _id: id, title, location, date, endDate, ageGroups, imageUrl, sport, participants: 64, description }}
      className="block h-full"
    >
      <div className="flex flex-col h-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-tournament-hover hover:scale-[1.02] border-border shadow-tournament">
        
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-primary text-primary-foreground font-medium">
              {sport}
            </Badge>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 p-6 justify-between">
          <div>
            <h3 className="text-xl font-bold text-card-foreground mb-3 line-clamp-2">
              {title}
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{location}</span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">
                  {date} {endDate && `- ${endDate}`}
                </span>
              </div>
            </div>
          </div>

          {/* <div className="flex flex-wrap gap-2 mt-auto">
            {ageGroups && ageGroups.length > 0 && ageGroups.map((ageGroup: string) => (
              <Badge 
                key={ageGroup} 
                variant="outline"
                className="bg-accent/20 text-accent-foreground border-accent/30 font-medium px-3 py-1"
              >
                {ageGroup}
              </Badge>
            ))}
          </div> */}
        </div>

      </div>
    </Link>
  );
};

export default TournamentCard;
