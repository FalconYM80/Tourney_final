import React from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  SportsEsports as TournamentsIcon,
  People as UsersIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { NavLink } from "react-router-dom";

const SidebarItems = () => {
  // Define your navigation items
  const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/" },
    { text: "Tournaments", icon: <TournamentsIcon />, path: "/tournaments" },
    { text: "Users", icon: <UsersIcon />, path: "/users" },
    { text: "Analytics", icon: <AnalyticsIcon />, path: "/analytics" },
    { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
  ];

  return (
    <List>
      {navItems.map((item) => (
        <ListItem key={item.text} disablePadding>
          <ListItemButton
            component={NavLink}
            to={item.path}
            sx={{
              "&.active": {
                backgroundColor: "rgba(25, 118, 210, 0.08)",
                "& .MuiListItemIcon-root": {
                  color: "primary.main",
                },
                "& .MuiListItemText-primary": {
                  fontWeight: "medium",
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default SidebarItems;