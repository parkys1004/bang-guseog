// functions/api/auth/check.ts

export const onRequestGet: PagesFunction<{
  FIREBASE_API_KEY: string;
  FIREBASE_PROJECT_ID: string;
}> = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const email = searchParams.get('email');

  // 환경 변수는 context.env에서 가져옵니다.
  const API_KEY = context.env.FIREBASE_API_KEY;
  const PROJECT_ID = context.env.FIREBASE_PROJECT_ID;

  if (!email) {
    return new Response(JSON.stringify({ canAccess: false, reason: 'no-email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Firestore REST API 호출
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/:runQuery?key=${API_KEY}`;
    
    const queryResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    const result: any = await queryResponse.json();

    // 데이터가 없거나 문서가 없는 경우
    if (!result || result.length === 0 || !result[0].document) {
      return new Response(JSON.stringify({ canAccess: false, reason: 'user-not-found' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fields = result[0].document.fields;
    const now = new Date();
    
    // 파이어베이스 필드 데이터 추출
    const expiryDateStr = fields.subscriptionEndDate?.stringValue || fields.subscriptionEndDate?.timestampValue;
    const tier = fields.tier?.stringValue || 'free';
    const name = fields.name?.stringValue || 'Guest';

    const expiryDate = new Date(expiryDateStr);
    const isExpired = now > expiryDate;

    // 최종 결과 반환
    return new Response(JSON.stringify({
      canAccess: !isExpired,
      tier: tier,
      name: name,
      reason: isExpired ? 'expired' : 'ok',
      expiryDate: expiryDateStr
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' // 다른 앱(Vercel)에서 호출 가능하도록 허용
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ canAccess: false, reason: 'server-error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
