import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./database.sqlite');

console.log('Fixing database...');

// Create profile_verifications table
db.run(`
  CREATE TABLE IF NOT EXISTS profile_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL,
    verification_code VARCHAR(4) NOT NULL,
    verification_photo_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    reviewed_by INTEGER,
    FOREIGN KEY (profile_id) REFERENCES profiles (id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users (id)
  )
`, (err) => {
  if (err) {
    console.log('Error creating profile_verifications table:', err.message);
  } else {
    console.log('✅ Table profile_verifications created successfully');
  }
  
  // Check if is_verified column exists
  db.all("PRAGMA table_info(profiles)", (err, columns) => {
    if (err) {
      console.log('Error checking table info:', err.message);
    } else {
      const hasVerifiedColumn = columns.some(col => col.name === 'is_verified');
      if (hasVerifiedColumn) {
        console.log('✅ Column is_verified already exists in profiles table');
      } else {
        console.log('❌ Column is_verified missing from profiles table');
      }
    }
    
    db.close();
    console.log('Database fix completed!');
  });
});
