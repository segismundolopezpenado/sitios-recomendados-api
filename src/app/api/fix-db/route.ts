import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting database fix...');
    
    // Try to add the elevation column if it doesn't exist
    try {
      await db.$executeRaw`ALTER TABLE Route ADD COLUMN elevation TEXT`;
      console.log('Elevation column added successfully');
    } catch (error: any) {
      if (error.message?.includes('duplicate column name') || error.code === 'SQLITE_ERROR') {
        console.log('Elevation column already exists');
      } else {
        console.log('Error adding elevation column:', error.message);
      }
    }
    
    // Try to add the gpxLink column if it doesn't exist
    try {
      await db.$executeRaw`ALTER TABLE Route ADD COLUMN gpxLink TEXT`;
      console.log('gpxLink column added successfully');
    } catch (error: any) {
      if (error.message?.includes('duplicate column name') || error.code === 'SQLITE_ERROR') {
        console.log('gpxLink column already exists');
      } else {
        console.log('Error adding gpxLink column:', error.message);
      }
    }
    
    // Test the schema by creating a route with elevation
    try {
      const testRoute = await db.route.create({
        data: {
          name: 'Schema Test Route',
          elevation: '100',
          gpxLink: 'test.gpx'
        }
      });
      console.log('Test route created successfully:', testRoute);
      
      // Clean up
      await db.route.delete({
        where: { id: testRoute.id }
      });
      console.log('Test route deleted');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Database schema fixed successfully' 
      });
      
    } catch (error: any) {
      console.log('Error creating test route:', error.message);
      return NextResponse.json({ 
        success: false, 
        message: 'Database schema fix failed',
        error: error.message 
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Database fix error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Database fix failed',
      error: error.message 
    }, { status: 500 });
  }
}