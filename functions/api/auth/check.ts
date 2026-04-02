// Cloudflare Pages Functions 규격
export const onRequestGet: PagesFunction<{
  FIREBASE_API_KEY: string;
  FIREBASE_PROJECT_ID: string;
}> = async (context) => {
  const { searchParams } = new URL(context.request.url);
  const email = searchParams.get('email');

  // 환경 변수 로드 (Cloudflare 대시보드에 등록된 값)
  const API_KEY = context.env.FIREBASE_API_KEY;
  const PROJECT_ID = context.env.FIREBASE_PROJECT_ID;

  if (!email) {
    return new Response(JSON.stringify({ canAccess: false, reason: 'no-email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
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

    // 유저를 찾지 못한 경우
    if (!result || result.length === 0 || !result[0].document) {
      return new Response(JSON.stringify({ canAccess: false, reason: 'user-not-found' }), {
        status: 200, // 통신은 성공했으므로 200 반환
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // Vercel 앱 허용
        },
      });
    }

    const fields = result[0].document.fields;
    const now = new Date();
    
    // DB의 필드명(subscriptionEndDate, tier)이 정확해야 합니다.
    const expiryDateStr = fields.subscriptionEndDate?.stringValue || fields.subscriptionEndDate?.timestampValue;
    const tier = fields.tier?.stringValue || 'basic';
    const expiryDate = new Date(expiryDateStr);
    
    const isExpired = now > expiryDate;

    return new Response(JSON.stringify({
      canAccess: !isExpired,
      tier: tier,
      reason: isExpired ? 'expired' : 'ok'
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*' 
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({ canAccess: false, reason: 'server-error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};