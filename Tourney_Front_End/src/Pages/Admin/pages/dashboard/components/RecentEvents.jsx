import {
  Card,
  CardContent,
  Typography,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Grow,
} from "@mui/material";
import {
  SportsSoccer as BadmintonIcon,
  SportsSoccer as FootballIcon,
} from "@mui/icons-material";

const events = [
  {
    name: "Summer Badminton Championship",
    date: "15-20 July 2024",
    icon: <BadmintonIcon color="primary" />,
    participants: 64,
  },
  {
    name: "Football League 2024",
    date: "1-15 August 2024",
    icon: <FootballIcon color="primary" />,
    participants: 120,
  },
];

const RecentEvents = () => (
  <Grow in timeout={1000}>
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 3,
        height: "100%",
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom color="primary">
          Recent Events
        </Typography>
        <List>
          {events.map((event, index) => (
            <ListItem key={index} sx={{ py: 1.5 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "primary.light" }}>{event.icon}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={event.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      {event.date}
                    </Typography>
                    <br />
                    <Typography component="span" variant="caption">
                      {event.participants} participants
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  </Grow>
);

export default RecentEvents;
