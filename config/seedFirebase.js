// config/seedFirebase.js
import seedAllDummyData from "./seedDummyData.js";

export default seedAllDummyData;

if (process.argv[1] && process.argv[1].endsWith("seedFirebase.js")) {
  seedAllDummyData()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
