import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Extract token and role from cookies
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  const isValidToken = Boolean(token && token !== 'undefined' && token !== 'null' && token.trim() !== '');
  const isValidRole = Boolean(role && (role === 'Vendor' || role === 'Organizer'));

  // Intercept requests to /vendor/* and /organizer/*
  const isVendorPath = path.startsWith('/vendor');
  const isOrganizerPath = path.startsWith('/organizer');

  if (isVendorPath || isOrganizerPath) {
    // If not authenticated or token/role is invalid, redirect to /auth and clear bad cookies
    if (!isValidToken || !isValidRole) {
      const response = NextResponse.redirect(new URL('/auth', request.url));
      response.cookies.delete('token');
      response.cookies.delete('role');
      response.cookies.delete('company_name');
      return response;
    }

    // Strict Role-Based Access Control
    if (isVendorPath && role !== 'Vendor') {
      return NextResponse.redirect(new URL('/organizer/dashboard', request.url));
    }

    if (isOrganizerPath && role !== 'Organizer') {
      return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Intercept requests to /vendor and /organizer and all nested routes
export const config = {
  matcher: ['/vendor/:path*', '/organizer/:path*'],
};
