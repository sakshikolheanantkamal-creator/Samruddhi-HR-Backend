import { query, initDatabase } from './src/config/db.js';

async function updateAdminEmail() {
  try {
    await initDatabase();
    
    // First check current user
    const currentUser = await query("SELECT id, username, email FROM users WHERE role = 'admin'");
    console.log("Current admin user:", currentUser.rows[0]);
    
    // Update username to admin@gmail.com
    const result = await query(
      "UPDATE users SET username = $1, email = $1 WHERE role = 'admin' RETURNING id, username, email, role",
      ['admin@gmail.com']
    );
    
    console.log("\n✅ Admin email updated successfully!");
    console.log("Updated user:", result.rows[0]);
    console.log("\nLogin credentials:");
    console.log("Email: admin@gmail.com");
    console.log("Password: Admin@123");
    
    process.exit(0);
  } catch (error) {
    console.error("Error updating admin email:", error);
    process.exit(1);
  }
}

updateAdminEmail();
