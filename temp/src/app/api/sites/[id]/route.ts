import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Update site in database
    const site = await db.site.update({
      where: { id: params.id },
      data: {
        name,
        city,
        province,
        priceRange,
        comments: comments || null,
        type,
        photos: photos.length > 0 ? photos.join('|||') : undefined,
        mapsLink: mapsLink || null
      }
    })

    // Convert photos string to array for response
    const siteWithPhotosArray = {
      ...site,
      photos: site.photos ? site.photos.split('|||').filter(Boolean) : []
    }

    return NextResponse.json(siteWithPhotosArray)
  } catch (error) {
    console.error('Error updating site:', error)
    return NextResponse.json({ error: 'Error updating site' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.site.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Site deleted successfully' })
  } catch (error) {
    console.error('Error deleting site:', error)
    return NextResponse.json({ error: 'Error deleting site' }, { status: 500 })
  }
}
