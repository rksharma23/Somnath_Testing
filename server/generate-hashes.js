const bcrypt = require('bcryptjs');
const fs = require('fs-extra');
const path = require('path');

async function generateHashes() {
  const users = [
    {
      id: 1,
      name: "Amit Sharma",
      email: "amit.sharma@example.in",
      password: "password123",
      mobile: "9876543210"
    },
    {
      id: 2,
      name: "Priya Singh",
      email: "priya.singh@example.in",
      password: "welcome2024",
      mobile: "9123456789"
    },
    {
      id: 3,
      name: "Rahul Verma",
      email: "rahul.verma@example.in",
      password: "india@2024",
      mobile: "9988776655"
    },
    {
      id: 4,
      name: "Sneha Patel",
      email: "sneha.patel@example.in",
      password: "testpass",
      mobile: "9001122334"
    }
  ];

  console.log('🔐 Generating bcrypt hashes for user passwords...\n');

  const hashedUsers = [];
  
  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    hashedUsers.push({
      ...user,
      password: hashedPassword
    });
    
    console.log(`✅ ${user.name} (${user.email})`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Hash: ${hashedPassword.substring(0, 20)}...`);
    console.log('');
  }

  // Write to users.json
  const usersFile = path.join(__dirname, 'data', 'users.json');
  await fs.writeJson(usersFile, hashedUsers, { spaces: 2 });
  
  console.log('📁 Updated data/users.json with proper bcrypt hashes');
  console.log('\n🎯 Now you can sign in with these credentials:');
  console.log('   Email: amit.sharma@example.in, Password: password123');
  console.log('   Email: priya.singh@example.in, Password: welcome2024');
  console.log('   Email: rahul.verma@example.in, Password: india@2024');
  console.log('   Email: sneha.patel@example.in, Password: testpass');
}

generateHashes().catch(console.error); 