import React from "react";
import { Drawer, Divider, IconButton, useTheme, styled } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import SidebarItems from "./SidebarItems";

const drawerWidth = 240;

const Sidebar = ({ open, setOpen }) => {
  const theme = useTheme();

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          background: "#f8fafc",
          borderRight: "1px solid rgba(0, 0, 0, 0.08)",
          transition: "all 0.3s ease",
        },
      }}
      variant="persistent"
      anchor="left"
      open={open}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          height: "64px",
          justifyContent: "flex-end",
        }}
      >
        <IconButton
          onClick={() => setOpen(false)}
          size="small"
          sx={{
            border: "1px solid rgba(0, 0, 0, 0.1)",
            "&:hover": {
              background: "rgba(0, 0, 0, 0.04)",
            },
          }}
        >
          <ChevronLeft />
        </IconButton>
      </div>
      <Divider />
      <SidebarItems />
    </Drawer>
  );
};

export default Sidebar;