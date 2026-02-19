exports.sendSMS = async ({ to, message }) => {
  console.log(`📱 SMS sent to ${to}: ${message}`);
  return { success: true };
};