import { Card, CardContent, Typography } from "@mui/material";

export default function QuantumSlide({ title, description }) {
  return (
    <Card sx={{ maxWidth: 500, margin: "20px auto" }}>
      <CardContent>
        <Typography variant="h4">{title}</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
