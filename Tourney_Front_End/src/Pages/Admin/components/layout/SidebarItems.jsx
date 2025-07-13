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

const navItems = [
  { text: "Dashboard", icon: <DashboardIcon />, path: "/admin/dashboard" },
  {
    text: "Tournaments",
    icon: <TournamentsIcon />,
    path: "/admin/tournaments",
  },
  { text: "Users", icon: <UsersIcon />, path: "players" },
  { text: "Organizations", icon: <UsersIcon />, path: "organizations" },
  // {
  //   text: "Create Tournament",
  //   icon: <AnalyticsIcon />,
  //   path: "/admin/add-tournament",
  // },
  // { text: "Settings", icon: <SettingsIcon />, path: "/settings" },
];

const SidebarItems = () => (
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

export default SidebarItems;
