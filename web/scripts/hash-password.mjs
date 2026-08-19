import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <your-admin-password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
const escaped = hash.replaceAll("$", "\\$");
console.log("\nADMIN_PASSWORD_HASH=" + escaped + "\n");
console.log(
  "Paste this into .env (and your server's env config). The $ signs are escaped as \\$ because " +
    "Next.js otherwise tries to expand $2b/$12/etc. as variable references and silently corrupts the hash.",
);
