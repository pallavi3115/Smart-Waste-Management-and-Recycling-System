exports.sendEmail = async ({ to, subject, template, data }) => {
  console.log(`📧 Email sent to ${to}: ${subject}`);
  return { success: true };
};