import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Extract token and role from cookies
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  // Intercept requests to /vendor/* and /organizer/*
  const isVendorPath = path.startsWith('/vendor');
  const isOrganizerPath = path.startsWith('/organizer');

  if (isVendorPath || isOrganizerPath) {
    // If not authenticated, redirect to /auth
    if (!token) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // Strict Role-Based Access Control
    if (isVendorPath && role !== 'Vendor') {
      // If a non-vendor (e.g. Organizer) tries to access /vendor, redirect to /organizer/dashboard
      return NextResponse.redirect(new URL('/organizer/dashboard', request.url));
    }

    if (isOrganizerPath && role !== 'Organizer') {
      // If a non-organizer (e.g. Vendor) tries to access /organizer, redirect to /vendor/dashboard
      return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Intercept requests to /vendor and /organizer and all nested routes
export const config = {
  matcher: ['/vendor/:path*', '/organizer/:path*'],
};
