import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const sites = await db.site.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Convert photos string to array
    const sitesWithPhotosArray = sites.map(site => ({
      ...site,
      photos: site.photos ? site.photos.split('|||').filter(Boolean) : []
    }))

    return NextResponse.json(sitesWithPhotosArray)
  } catch (error) {
    console.error('Error fetching sites:', error)
    return NextResponse.json({ error: 'Error fetching sites' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract form data
    const name = formData.get('name') as string
    const city = formData.get('city') as string
    const province = formData.get('province') as string
    const priceRange = formData.get('priceRange') as string
    const comments = formData.get('comments') as string
    const type = formData.get('type') as 'comer' | 'dormir'
    const mapsLink = formData.get('mapsLink') as string

    // Handle photos
    const photos: string[] = []
    for (let i = 0; i < 3; i++) {
      const photo = formData.get(`photo${i}`) as File | null
      if (photo) {
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const base64 = buffer.toString('base64')
        photos.push(base64)
      }
    }

    // Create site in database
    const site = await db.site.create({
      data: {
        name,
        city,
        province,
        priceRange,
        comments: comments || null,
        type,
        photos: photos.join('|||'),
        mapsLink: mapsLink || null
      }
    })

    // Convert photos string to array for response
    const siteWithPhotosArray = {
      ...site,
      photos: site.photos ? site.photos.split('|||').filter(Boolean) : []
    }

    return NextResponse.json(siteWithPhotosArray, { status: 201 })
  } catch (error) {
    console.error('Error creating site:', error)
    return NextResponse.json({ error: 'Error creating site' }, { status: 500 })
  }
}
