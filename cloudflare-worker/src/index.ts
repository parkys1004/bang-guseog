export interface Env {
  // 환경 변수 (Cloudflare 대시보드에서 설정하거나 wrangler secret으로 등록)
  FIREBASE_DATABASE_URL: string;
  FIREBASE_AUTH_SECRET: string; // Firebase Realtime Database Secret (Legacy) 또는 Service Account Token
  RESEND_API_KEY: string;
  SENDER_EMAIL: string;
}

export default {
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

    // Firebase URL 설정 (마지막 슬래시 제거)
    const dbUrl = env.FIREBASE_DATABASE_URL.replace(/\/$/, '');
    const authParam = `?auth=${env.FIREBASE_AUTH_SECRET}`;

    // 2. Firebase Realtime Database 업데이트 (globalConfig/currentPassword)
    const updateUrl = `${dbUrl}/globalConfig/currentPassword.json${authParam}`;
    const updateRes = await fetch(updateUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPassword),
    });

    if (!updateRes.ok) {
      throw new Error(`Failed to update password in Firebase: ${await updateRes.text()}`);
    }

    // 3. Firebase에서 유저 목록 조회
    const usersUrl = `${dbUrl}/users.json${authParam}`;
    const usersRes = await fetch(usersUrl);
    
    if (!usersRes.ok) {
      throw new Error(`Failed to fetch users: ${await usersRes.text()}`);
    }

    const usersData = await usersRes.json();
    if (!usersData) {
      console.log("No users found.");
      return;
    }

    // 4. 조건에 맞는 유저 필터링 (grade가 silver/gold 이고 expiryDate가 남은 유저)
    const now = new Date().getTime();
    const targetEmails: string[] = [];

    for (const key in usersData) {
      const user = usersData[key];
      if (!user || !user.email) continue;

      const isEligibleGrade = user.grade === 'silver' || user.grade === 'gold';
      
      // expiryDate가 ISO String이거나 Timestamp(숫자)일 수 있으므로 Date 객체로 변환
      const expiryTime = new Date(user.expiryDate).getTime();
      const isValidDate = !isNaN(expiryTime) && expiryTime > now;

      if (isEligibleGrade && isValidDate) {
        targetEmails.push(user.email);
      }
    }

    console.log(`Found ${targetEmails.length} eligible users to notify.`);
    if (targetEmails.length === 0) return;

    // 5. Resend API를 사용하여 이메일 발송 (Batch API 사용)
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
