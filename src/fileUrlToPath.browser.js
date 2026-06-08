// 브라우저/Web Worker 빌드 전용. node:url 이 없고, 콜사이트 location 은
// 브라우저 entry 에서 소비되지 않으므로 identity 패스스루로 충분하다.
export const fileURLToPath = (url) => url;
