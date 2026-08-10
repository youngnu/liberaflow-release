# Liberaflow 호스팅 마이그레이션 가이드

## 현재 프로젝트 환경

| 항목 | 값 |
|------|-----|
| **도메인** | liberaflow.com |
| **도메인 등록기관** | Squarespace Domains |
| **네임서버** | Google Cloud DNS (ns-cloud-b1~b4.googledomains.com) |
| **호스팅** | GitHub Pages |
| **GitHub 레포** | github.com/youngnu/liberaflow-release |
| **CNAME** | www.liberaflow.com → youngnu.github.io |
| **GitHub Pages IP** | 185.199.108~111.153 |
| **사이트 유형** | 정적 HTML (index.html + features/*.html + assets/) |
| **자동 배포** | git push → main 브랜치 → GitHub Pages 자동 반영 |

### 프로젝트 구조
```
liberaflow-release/
├── index.html              # 메인 페이지
├── docs.html               # 문서 페이지
├── email-confirmation.html # 이메일 확인 페이지
├── reset-password.html     # 비밀번호 재설정 페이지
├── CNAME                   # GitHub Pages 커스텀 도메인 (liberaflow.com)
├── robots.txt              # 검색엔진 크롤링 설정
├── sitemap.xml             # 사이트맵
├── features/               # 기능 소개 페이지들
│   ├── ai-chat.html
│   ├── calendar.html
│   ├── liberaflow-note.html
│   ├── mind-map.html
│   ├── python-automation.html
│   ├── space.html
│   └── tasks.html
├── assets/                 # 이미지, JS, 비디오 리소스
│   ├── images/
│   ├── js/
│   └── videos/
├── downloads/              # 앱 다운로드 파일 (exe, dmg)
│   ├── Liberaflow_1.2.2_Setup.exe
│   ├── Liberaflow-1.2.0-macos.dmg
│   ├── Liberaflow-1.2.3-macos.dmg
│   └── appcast.xml
└── updates/                # 업데이트 관련 파일
```

---

## 문제 상황

한국 특정 기관(학교, 공공기관, 군부대, 일부 기업)의 네트워크에서 liberaflow.com 접속 시 `ERR_CONNECTION_TIMED_OUT` 발생.

### 원인
GitHub Pages의 공유 IP 대역(185.199.108~111.x)이 한국 기관 네트워크 방화벽/필터링(SafeNet 등)에 의해 차단됨. GitHub Pages는 공유 인프라이므로, 피싱/악성 사이트도 같은 IP를 사용 → IP 대역째 차단하는 기관이 존재.

### 비교 대상
inline-ai.com (Framer 호스팅, 서울 리전, IP: 31.43.160.6) → 같은 기관에서 정상 접근 가능

---

## 방침 1: Cloudflare 프록시 (최우선)

> GitHub Pages는 유지하면서 Cloudflare를 앞단 프록시로 설정하여 IP를 Cloudflare IP로 변경

### 장점
- 코드 변경 불필요
- 무료 플랜 사용 가능
- GitHub Pages 자동 배포 그대로 유지
- DDoS 보호, CDN 캐싱 등 추가 혜택

### 설정 단계

#### 1단계: Cloudflare 계정 생성 및 도메인 추가
1. https://dash.cloudflare.com 에서 계정 생성/로그인
2. "Add a Site" 클릭 → `liberaflow.com` 입력
3. Free 플랜 선택

#### 2단계: DNS 레코드 설정 (Cloudflare 대시보드)
Cloudflare가 기존 DNS를 자동 스캔함. 다음과 같이 설정 확인/수정:

```
Type    Name              Content                 Proxy
A       liberaflow.com    185.199.108.153         ☁️ Proxied (주황색 구름)
A       liberaflow.com    185.199.109.153         ☁️ Proxied
A       liberaflow.com    185.199.110.153         ☁️ Proxied
A       liberaflow.com    185.199.111.153         ☁️ Proxied
CNAME   www               youngnu.github.io       ☁️ Proxied
TXT     liberaflow.com    google-site-verification=...  (프록시 없음)
TXT     liberaflow.com    v=spf1 -all                   (프록시 없음)
```

**중요: 반드시 Proxy 상태를 "Proxied" (주황색 구름)로 설정해야 IP가 Cloudflare IP로 변경됨**

#### 3단계: 네임서버 변경
Cloudflare가 제공하는 네임서버 2개를 확인하고, Squarespace Domains(또는 Google Domains)에서 네임서버를 변경:

1. Squarespace Domains 관리 페이지 접속 (domains.squarespace.com)
2. liberaflow.com 선택 → DNS 설정
3. 네임서버를 Cloudflare가 제공한 네임서버로 변경
   - 기존: ns-cloud-b1~b4.googledomains.com
   - 변경: Cloudflare가 제공하는 네임서버 (예: xxx.ns.cloudflare.com)

#### 4단계: Cloudflare SSL 설정
1. Cloudflare 대시보드 → SSL/TLS
2. 암호화 모드: **Full** 선택 (GitHub Pages가 자체 SSL 제공하므로)
3. "Always Use HTTPS" 활성화
4. "Automatic HTTPS Rewrites" 활성화

#### 5단계: 페이지 규칙 설정 (선택)
- `http://liberaflow.com/*` → Always Use HTTPS
- `http://www.liberaflow.com/*` → Forwarding URL (301) → `https://liberaflow.com/$1`

#### 6단계: 확인
```bash
# 네임서버 변경 후 전파 대기 (최대 24~48시간, 보통 수 시간)
dig liberaflow.com +short
# → Cloudflare IP가 나오면 성공 (104.x.x.x 또는 172.x.x.x 등)

# 프록시 확인
curl -sI https://liberaflow.com | grep server
# → "server: cloudflare" 가 나오면 성공
```

### 주의사항
- GitHub Pages의 CNAME 파일은 그대로 유지
- GitHub Pages 레포 설정의 Custom domain도 그대로 유지
- Cloudflare에서 "Flatten CNAME at root" 자동 처리됨
- 네임서버 변경 후 전파까지 시간이 걸릴 수 있음

---

## 방침 2: Vercel / Netlify로 이전

> GitHub Pages 대신 Vercel 또는 Netlify에 호스팅. GitHub 레포 연동으로 자동 배포 유지.

### 장점
- 한국 리전 CDN 지원 (더 빠른 속도)
- GitHub Pages보다 유연한 설정
- 자동 HTTPS, 프리뷰 배포 등

### Vercel 설정 단계

1. https://vercel.com 에서 GitHub 계정으로 로그인
2. "Import Project" → `youngnu/liberaflow-release` 레포 선택
3. Framework: "Other" 선택 (정적 사이트)
4. 배포 완료 후 도메인 설정:
   - Vercel 대시보드 → Settings → Domains → `liberaflow.com` 추가
   - Vercel이 안내하는 DNS 레코드로 변경
5. **GitHub Pages 비활성화**:
   - GitHub 레포 Settings → Pages → Source를 "None"으로 변경
   - `CNAME` 파일은 삭제하거나 유지 (Vercel은 CNAME 파일 불필요)
6. DNS 레코드 변경:
   - A 레코드: Vercel이 제공하는 IP로 변경 (76.76.21.21)
   - CNAME www: cname.vercel-dns.com

### Netlify 설정 단계

1. https://app.netlify.com 에서 GitHub 계정으로 로그인
2. "Add new site" → "Import an existing project" → GitHub 레포 선택
3. Build settings: Publish directory = `/` (루트)
4. 배포 완료 후 도메인 설정:
   - Site settings → Domain management → Add domain → `liberaflow.com`
5. DNS 변경:
   - A 레코드: 75.2.60.5
   - CNAME www: [사이트명].netlify.app

### 주의사항
- downloads/ 내 대용량 파일(exe, dmg)은 Vercel/Netlify의 파일 크기 제한 확인 필요
  - Vercel: 파일 당 100MB 제한
  - Netlify: 사이트 당 100MB~500MB (플랜에 따라 다름)
- 대용량 파일은 GitHub Releases 또는 별도 스토리지(S3, R2 등)로 이전 권장

---

## 방침 3: 한국 호스팅으로 이전

> 한국 호스팅 인프라(카페24, 가비아 등) 또는 Framer/Wix 같은 웹빌더 사용

### 장점
- 한국 기관 네트워크에서 가장 확실하게 접근 가능
- 한국 사용자 대상 최적 속도

### 단점
- 현재 GitHub Pages 자동 배포 워크플로 완전 변경 필요
- 정적 사이트를 직접 업로드하거나 별도 CI/CD 구성 필요
- 비용 발생 가능

### 권장하지 않는 이유
- 방침 1(Cloudflare)이나 방침 2(Vercel/Netlify)로 대부분 해결 가능
- 현재 워크플로(git push → 자동 배포)를 유지하기 어려움

---

## 진행 상태 추적

- [x] 문제 원인 분석 완료 (GitHub Pages IP 차단)
- [ ] 방침 1: Cloudflare 프록시 설정
  - [ ] Cloudflare 계정 생성 및 사이트 추가
  - [ ] DNS 레코드 설정 (Proxied 모드)
  - [ ] 네임서버 변경 (Squarespace → Cloudflare)
  - [ ] SSL 설정 확인
  - [ ] 차단된 기관에서 접속 테스트
- [ ] 방침 2: Vercel/Netlify 이전 (방침 1 실패 시)
- [ ] 방침 3: 한국 호스팅 이전 (방침 1, 2 모두 실패 시)
