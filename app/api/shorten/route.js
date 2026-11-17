import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'database.json');

function readDatabase() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}), 'utf8');
      return {};
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data || '{}');
  } catch (error) {
    return {};
  }
}

function writeDatabase(data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing database file:', error);
  }
}

export async function GET() {
  const db = readDatabase();
  return NextResponse.json(db);
}

export async function POST(request) {
  try {
    const { longUrl } = await request.json();
    if (!longUrl) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const shortId = Math.random().toString(36).substring(2, 7);
    const db = readDatabase();
    
    db[shortId] = { longUrl, clicks: 0 };
    writeDatabase(db);

    const shortUrl = `http://localhost:3000/${shortId}`;
    return NextResponse.json({ shortUrl, shortId });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// NEW METHOD ROUTE: Deletes a specific short link from our local storage
export async function DELETE(request) {
  try {
    const { shortId } = await request.json();
    const db = readDatabase();

    if (db[shortId]) {
      delete db[shortId]; // Delete entry entirely from json key mapping
      writeDatabase(db);
      return NextResponse.json({ success: true, message: 'Link successfully removed' });
    }

    return NextResponse.json({ error: 'Link identifier not found' }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}




