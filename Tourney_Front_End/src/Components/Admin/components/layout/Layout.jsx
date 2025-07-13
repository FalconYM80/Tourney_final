import React, { useState } from "react";
import { Box, CssBaseline, styled } from "@mui/material";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const drawerWidth = 240;

// DrawerHeader component for proper spacing
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const Layout = ({ children }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Topbar open={open} setOpen={setOpen} />
      <Sidebar open={open} setOpen={setOpen} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          transition: (theme) =>
            theme.transitions.create("margin", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
          marginLeft: `-${drawerWidth}px`,
          ...(open && {
            transition: (theme) =>
              theme.transitions.create("margin", {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
            marginLeft: 0,
          }),
        }}
      >
        <DrawerHeader /> {/* Spacer */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;