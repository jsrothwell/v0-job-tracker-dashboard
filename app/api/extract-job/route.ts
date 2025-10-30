import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Fetch the job posting page
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch job posting" }, { status: 400 })
    }

    const html = await response.text()

    // Extract job data using regex patterns and common HTML structures
    const extractedData = {
      job_title: extractJobTitle(html, url),
      company_name: extractCompanyName(html, url),
      location: extractLocation(html),
      description: extractDescription(html),
    }

    return NextResponse.json(extractedData)
  } catch (error) {
    console.error("[v0] Error extracting job data:", error)
    return NextResponse.json({ error: "Failed to extract job data" }, { status: 500 })
  }
}

function extractJobTitle(html: string, url: string): string {
  // Try multiple patterns for job title extraction
  const patterns = [
    /<h1[^>]*class="[^"]*job-title[^"]*"[^>]*>([^<]+)<\/h1>/i,
    /<h1[^>]*>([^<]+)<\/h1>/i,
    /<meta property="og:title" content="([^"]+)"/i,
    /<title>([^<|]+)/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      return match[1].trim().replace(/\s+/g, " ")
    }
  }

  // LinkedIn specific
  if (url.includes("linkedin.com")) {
    const match = html.match(/<h1[^>]*class="[^"]*topcard__title[^"]*"[^>]*>([^<]+)<\/h1>/i)
    if (match) return match[1].trim()
  }

  return ""
}

function extractCompanyName(html: string, url: string): string {
  const patterns = [
    /<span[^>]*class="[^"]*company[^"]*"[^>]*>([^<]+)<\/span>/i,
    /<a[^>]*class="[^"]*company[^"]*"[^>]*>([^<]+)<\/a>/i,
    /<meta property="og:site_name" content="([^"]+)"/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      return match[1].trim().replace(/\s+/g, " ")
    }
  }

  // LinkedIn specific
  if (url.includes("linkedin.com")) {
    const match = html.match(/<a[^>]*class="[^"]*topcard__org-name-link[^"]*"[^>]*>([^<]+)<\/a>/i)
    if (match) return match[1].trim()
  }

  return ""
}

function extractLocation(html: string): string {
  const patterns = [
    /<span[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)<\/span>/i,
    /<div[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)<\/div>/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      return match[1].trim().replace(/\s+/g, " ")
    }
  }

  return ""
}

function extractDescription(html: string): string {
  const patterns = [
    /<div[^>]*class="[^"]*description[^"]*"[^>]*>([\s\S]{0,500})/i,
    /<meta name="description" content="([^"]+)"/i,
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1]) {
      // Strip HTML tags and limit length
      const text = match[1].replace(/<[^>]+>/g, "").trim()
      return text.substring(0, 300) + (text.length > 300 ? "..." : "")
    }
  }

  return ""
}
