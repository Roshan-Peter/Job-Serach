import dotenv from 'dotenv';
import connectDB from '../Database/mongoDB.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';

dotenv.config();

const email = process.argv[2];
const role  = process.argv[3] || 'super_admin';

if (!email) {
  console.error('Usage: node scripts/makeAdmin.js <email> [role]');
  console.error('Roles: super_admin | admin | moderator');
  process.exit(1);
}

await connectDB();

const user = await User.findOne({ email });
if (!user) {
  console.error('No user found with email:', email);
  process.exit(1);
}

const existing = await Admin.findOne({ userId: user._id });
if (existing) {
  console.log(`${email} is already an admin (role: ${existing.role})`);
  process.exit(0);
}

await Admin.create({ userId: user._id, addedBy: null, role });
console.log(`✅ ${email} added as ${role}`);
process.exit(0);



//node scripts/makeAdmin.js admin@example.com super_admin