import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const company = searchParams.get("company")

  if (!company) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 })
  }

  // Mock company insights data
  // In production, this would call external APIs like Clearbit, LinkedIn, or Glassdoor
  const mockInsights = {
    industry: "Technology & Software",
    company_size: "1,000-5,000 employees",
    glassdoor_rating: 4.2,
    recent_news_url: `https://www.google.com/search?q=${encodeURIComponent(company)}+news&tbm=nws`,
  }

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(mockInsights)
}
