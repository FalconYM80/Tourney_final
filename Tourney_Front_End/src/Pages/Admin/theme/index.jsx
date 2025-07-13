const theme = createTheme({
  palette: {
    primary: {
      main: "#4361ee", // More vibrant blue
      light: "#e0e7ff",
    },
    success: {
      main: "#4cc9f0", // Trend up color
    },
    error: {
      main: "#f72585", // Trend down color
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          overflow: "visible", // For hover effects
        },
      },
    },
  },
});
