// Cloudflare Pages/Workers 환경 기준 (Next.js)
export const runtime = 'edge'; // Cloudflare Edge에서 실행되도록 설정

import { NextResponse } from 'next/server';
// 주의: Cloudflare Edge에서는 firebase-admin 대신 일반 firebase SDK를 권장하지만, 
// 관리자 권한이 필요하므로 REST API나 전용 라이브러리를 사용합니다.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) return NextResponse.json({ canAccess: false, reason: 'no-email' });

  // 1. 파이어베이스 REST API를 사용하여 DB 조회 (가장 가볍고 빠름)
  // Cloudflare에서 직접 Firestore 데이터를 읽어오는 방식입니다.
  const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  try {
    // Firestore 유저 컬렉션에서 이메일로 검색
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/:runQuery?key=${FIREBASE_API_KEY}`;
    
    const queryResponse = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'users' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'email' },
              op: 'EQUAL',
              value: { stringValue: email }
            }
          }
        }
      })
    });

    const result = await queryResponse.json();
    
    if (!result || result.length === 0 || !result[0].document) {
      return NextResponse.json({ canAccess: false, reason: 'user-not-found' });
    }

    const userData = result[0].document.fields;
    const now = new Date();
    // 파이어베이스에서 가져온 만료일 (stringValue 또는 timestampValue)
    const expiryDate = new Date(userData.subscriptionEndDate.stringValue);

    // 2. 권한 판별
    const isExpired = now > expiryDate;

    return NextResponse.json({
      canAccess: !isExpired,
      tier: userData.tier.stringValue,
      name: userData.name.stringValue,
      reason: isExpired ? 'expired' : 'ok'
    });

  } catch (error) {
    return NextResponse.json({ canAccess: false, reason: 'server-error' });
  }
}
