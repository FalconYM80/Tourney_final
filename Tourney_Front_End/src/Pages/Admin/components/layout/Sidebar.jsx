import React from "react";
import {
  Divider,
  IconButton,
  Box,
  Typography,
  Avatar,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import SidebarItems from "./SidebarItems";

// Logo section
const Logo = () => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1,
      py: 3,
      px: 2,
      mb: 1,
    }}
  >
    <Avatar
      sx={{ bgcolor: "primary.main", width: 36, height: 36, fontWeight: 700 }}
    >
      AD
    </Avatar>
    <Typography
      variant="h6"
      fontWeight={700}
      letterSpacing={1}
      color="primary.main"
    >
      Admin
    </Typography>
  </Box>
);

const Sidebar = ({ onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        boxShadow: 3,
        borderRadius: { xs: 0, sm: "0 16px 16px 0" },
        overflow: "hidden",
        minWidth: 240,
        width: { xs: "90vw", sm: 240 }, // Responsive width
        maxWidth: { xs: "90vw", sm: 240 },
        position: "relative",
      }}
    >
      {/* Mobile: Always show close button at the very top */}
      {isMobile && onClose && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            height: "56px",
            px: 2,
            background: "background.paper",
            position: "sticky",
            top: 0,
            zIndex: 2,
            boxShadow: 1,
          }}
        >
          <IconButton onClick={onClose} size="large">
            <ChevronLeft />
          </IconButton>
        </Box>
      )}

      {/* Logo/Title (hide on mobile if you want more space, or keep) */}
      <Logo />

      <Divider sx={{ mb: 1 }} />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1 }}>
        <SidebarItems />
      </Box>

      {/* Optional: User info at the bottom */}
      <Divider sx={{ mt: 1 }} />
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{
          p: 2,
          pb: 2.5,
          background: "background.paper",
          position: "sticky",
          bottom: 0,
        }}
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main" }}>
          U
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600}>
            User Name
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Admin
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default Sidebar;
