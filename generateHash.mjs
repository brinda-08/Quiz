import bcrypt from 'bcryptjs';

(async () => {
  const hash = await bcrypt.hash("superadmin123", 10);
  console.log("Hashed password:", hash);
})();
