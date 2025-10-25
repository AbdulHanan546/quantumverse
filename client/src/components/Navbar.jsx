import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <AppBar position="sticky" sx={{ px: 2 }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          QuantumVerse
        </Typography>

        <Box sx={{ display: "flex", gap: 3 }}>
          <Button component={Link} to="/" color="inherit">
            Home
          </Button>
          <Button component={Link} to="/topics" color="inherit">
            Topics
          </Button>
          <Button component={Link} to="/about" color="inherit">
            About
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
