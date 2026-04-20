export interface Env {
  // 환경 변수 (Cloudflare 대시보드에서 설정하거나 wrangler secret으로 등록)
  FIREBASE_PROJECT_ID: string;
  FIREBASE_DATABASE_ID?: string; // 추가: 특정 데이터베이스 ID (없으면 (default) 사용)
  FIREBASE_WEB_API_KEY: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  RESEND_API_KEY: string;
  SENDER_EMAIL: string;
}

export default {
  // HTTP 요청을 처리하는 함수 (빌더앱에서 비밀번호 검증 API로 사용)
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // CORS Preflight 처리
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    // /verify 엔드포인트: 빌더앱에서 비밀번호 검증 요청 시 처리
    if (url.pathname === '/verify') {
      // GET 요청 핸들링 (연결 테스트용)
      if (request.method === 'GET') {
        const projectIdForDebug = env.FIREBASE_PROJECT_ID || 'gen-lang-client-0979707528';
        const rawDbIdForDebug = env.FIREBASE_DATABASE_ID || 'ai-studio-dbbbbaa2-1129-4959-b336-f0af63245a60';
        const databaseIdForDebug = rawDbIdForDebug.replace(/['"]/g, '').trim();

        return new Response(JSON.stringify({ 
          status: 'online', 
          message: '방구석 작곡가 워커가 정상 작동 중입니다. 비밀번호 확인은 POST로 요청하세요.',
          env_check: {
            projectId: projectIdForDebug,
            databaseId: databaseIdForDebug
          }
        }), { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
      }

      try {
        const body = await request.json() as { password?: string };
        const inputPassword = body.password;

        if (!inputPassword) {
          return new Response(JSON.stringify({ valid: false, message: '비밀번호를 입력해주세요.' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // 0. Fallback Values (환경 변수가 없을 경우 대비)
        const projectId = env.FIREBASE_PROJECT_ID || 'gen-lang-client-0979707528';
        const rawDbId = env.FIREBASE_DATABASE_ID || 'ai-studio-dbbbbaa2-1129-4959-b336-f0af63245a60';
        const databaseId = rawDbId.replace(/['"]/g, '').trim() || 'ai-studio-dbbbbaa2-1129-4959-b336-f0af63245a60';

        // 1. Firestore에서 현재 마스터 비밀번호 읽어오기 (보안규칙에서 공개 읽기 허용됨)
        const docUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/config/globalConfig`;
        const docResponse = await fetch(docUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!docResponse.ok) {
          const errText = await docResponse.text();
          return new Response(JSON.stringify({ 
            valid: false, 
            message: `데이터베이스 연결 오류. Project: ${projectId}, DB: ${databaseId}. Error: ${errText.substring(0, 100)}` 
          }), { 
            status: 200, // 클라이언트 측에서 "연결 실패"로 뜨는 것을 방지하기 위해 200 반환
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }

        const docData: any = await docResponse.json();
        const currentPassword = docData.fields?.currentPassword?.stringValue;

        if (!currentPassword) {
          return new Response(JSON.stringify({ 
            valid: false, 
            message: '데이터베이스에 마스터 비밀번호가 설정되어 있지 않습니다. 관리자 대시보드에서 먼저 설정해주세요.' 
          }), { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }

        // 2. 비밀번호 비교
        if (inputPassword === currentPassword) {
          return new Response(JSON.stringify({ valid: true }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          return new Response(JSON.stringify({ valid: false, message: '비밀번호가 일치하지 않습니다.' }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

      } catch (error) {
        return new Response(JSON.stringify({ 
          valid: false, 
          message: `서버 내부 오류: ${error instanceof Error ? error.message : String(error)}` 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },

  // Cron Trigger가 발생할 때 실행되는 함수
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    // waitUntil을 통해 비동기 작업이 끝날 때까지 Worker가 종료되지 않도록 보장
    ctx.waitUntil(rotatePasswordAndNotify(env));
  },
};

async function rotatePasswordAndNotify(env: Env) {
  try {
    // 1. 새로운 6자리 랜덤 비밀번호 생성 (100000 ~ 999999)
    const newPassword = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`[${new Date().toISOString()}] Generated new password: ${newPassword}`);

    // 2. Admin 계정으로 로그인하여 ID Token 획득 (Firestore 접근용)
    const authUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.FIREBASE_WEB_API_KEY}`;
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: env.ADMIN_EMAIL,
        password: env.ADMIN_PASSWORD,
        returnSecureToken: true
      })
    });

    if (!authResponse.ok) {
      throw new Error(`Failed to authenticate admin: ${await authResponse.text()}`);
    }

    const authData: any = await authResponse.json();
    const idToken = authData.idToken;

    // 3. Firestore 업데이트 (config/globalConfig)
    const projectId = env.FIREBASE_PROJECT_ID || 'gen-lang-client-0979707528';
    const rawDbId = env.FIREBASE_DATABASE_ID || 'ai-studio-dbbbbaa2-1129-4959-b336-f0af63245a60';
    const databaseId = rawDbId.replace(/['"]/g, '').trim() || 'ai-studio-dbbbbaa2-1129-4959-b336-f0af63245a60';
    const updateUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/config/globalConfig?updateMask.fieldPaths=currentPassword&updateMask.fieldPaths=lastUpdated&updateMask.fieldPaths=lastUpdatedBy`;
    const updateRes = await fetch(updateUrl, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        fields: {
          currentPassword: { stringValue: newPassword },
          lastUpdated: { stringValue: new Date().toISOString() },
          lastUpdatedBy: { stringValue: 'Cloudflare Worker (Auto)' }
        }
      }),
    });

    if (!updateRes.ok) {
      throw new Error(`Failed to update password in Firestore: ${await updateRes.text()}`);
    }

    // 4. Firestore에서 유저 목록 조회
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/users`;
    const usersRes = await fetch(firestoreUrl, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
    
    if (!usersRes.ok) {
      throw new Error(`Failed to fetch users from Firestore: ${await usersRes.text()}`);
    }

    const usersData: any = await usersRes.json();
    if (!usersData.documents || usersData.documents.length === 0) {
      console.log("No users found.");
      return;
    }

    // 5. 조건에 맞는 유저 필터링 (tier가 silver/gold 이고 subscriptionEndDate가 남은 유저)
    const now = new Date().getTime();
    const targetEmails: string[] = [];

    for (const doc of usersData.documents) {
      const fields = doc.fields;
      if (!fields || !fields.email || !fields.email.stringValue) continue;

      const email = fields.email.stringValue;
      const tier = fields.tier?.stringValue;
      const subEndDate = fields.subscriptionEndDate?.stringValue;

      const isEligibleTier = tier === 'silver' || tier === 'gold';
      
      let isValidDate = false;
      if (!subEndDate) {
        isValidDate = false; // 구독 종료일이 없으면 만료된 것으로 간주 (또는 정책에 따라 변경 가능)
      } else if (subEndDate === 'unlimited') {
        isValidDate = true;
      } else {
        const expiryTime = new Date(subEndDate).getTime();
        isValidDate = !isNaN(expiryTime) && expiryTime > now;
      }

      if (isEligibleTier && isValidDate) {
        targetEmails.push(email);
      }
    }

    console.log(`Found ${targetEmails.length} eligible users to notify.`);
    if (targetEmails.length === 0) return;

    // 6. Resend API를 사용하여 이메일 발송 (Batch API 사용)
    // Resend Batch API는 한 번에 최대 100개의 이메일만 보낼 수 있으므로 청크로 나눕니다.
    const CHUNK_SIZE = 100;
    for (let i = 0; i < targetEmails.length; i += CHUNK_SIZE) {
      const emailChunk = targetEmails.slice(i, i + CHUNK_SIZE);
      
      const emailPayloads = emailChunk.map(email => ({
        from: env.SENDER_EMAIL || 'Admin <noreply@yourdomain.com>',
        to: [email],
        subject: '[공지] 이번 달 새로운 비밀번호 안내',
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>새로운 비밀번호 안내</h2>
            <p>안녕하세요,</p>
            <p>이번 달 새롭게 변경된 관리자 사이트 비밀번호를 안내해 드립니다.</p>
            <div style="background-color: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">
                ${newPassword}
              </span>
            </div>
            <p>이 비밀번호는 외부로 유출되지 않도록 주의해 주시기 바랍니다.</p>
            <p>감사합니다.</p>
          </div>
        `
      }));

      const resendRes = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailPayloads)
      });

      if (!resendRes.ok) {
        console.error(`Failed to send email chunk: ${await resendRes.text()}`);
      } else {
        console.log(`Successfully sent email chunk ${i / CHUNK_SIZE + 1}`);
      }
    }

  } catch (error) {
    console.error("Error in rotatePasswordAndNotify:", error);
  }
}
