import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

app.listen(PORT, () => {
  console.log(`SmartSeason backend running on port ${PORT}`);
});
