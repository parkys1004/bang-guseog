
/**
 * 웹사이트 URL을 입력받아 해당 사이트의 스크린샷 이미지 URL을 반환합니다.
 * 기존 WordPress mshots는 최신 SPA(React 등) 사이트 렌더링에 실패하는 경우가 많아
 * Microlink API로 변경하여 호환성을 높였습니다.
 */
export const getScreenshotUrl = (url: string): string => {
  if (!url || url === 'https://dribbble.com/') {
    // URL이 없거나 데모 URL인 경우 기본 추상적인 이미지 반환
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop';
  }
  
  // Microlink API 사용
  // screenshot=true: 스크린샷 기능 활성화
  // meta=false: 메타데이터 제외
  // embed=screenshot.url: 이미지 URL 직접 반환
  // viewport: 해상도 설정
  // nrg=1: 에너지 절약 모드 해제 (더 빠른 렌더링 시도)
  const encodedUrl = encodeURIComponent(url);
  return `https://api.microlink.io/?url=${encodedUrl}&screenshot=true&meta=false&embed=screenshot.url&viewport.width=1280&viewport.height=960`;
};
