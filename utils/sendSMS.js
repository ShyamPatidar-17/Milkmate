const axios = require("axios");

const sendSMS = async (to, message) => {
  try {
    const res = await axios.post("https://www.fast2sms.com/dev/bulkV2", {
      route: "q",
      message: message,
      language: "english",
      flash: 0,
      numbers: to,
    }, {
      headers: {
        "authorization": "YOUR_FAST2SMS_API_KEY", // Get it from Fast2SMS dashboard
        "Content-Type": "application/json"
      }
    });

    console.log("SMS sent:", res.data);
  } catch (err) {
    console.error("Failed to send SMS:", err.message);
  }
};

module.exports = sendSMS;
