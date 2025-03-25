import app from "./server";
import logger from "./services/logger";

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
