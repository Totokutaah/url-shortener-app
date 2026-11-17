import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'database.json');

export async function GET(request, { params }) {
  const { code } = await params;

  try {
    // Read the current state of our file-system store
    if (fs.existsSync(filePath)) {
      const db = JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}');

      // Check if the short code identifier maps to a registered URL record
      if (db[code]) {
        db[code].clicks += 1; // Increment the persistent metric flag layout counter
        
        // Write the updated tracking analytics data logs back into disk memory
        fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf8');
        
        return NextResponse.redirect(db[code].longUrl);
      }
    }
  } catch (error) {
    console.error('Redirect pipeline file storage handling error:', error);
  }

  // Fallback landing page address if mapping does not exist
  return NextResponse.redirect('https://github.com');
}

