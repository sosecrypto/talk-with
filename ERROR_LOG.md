# Error Log

프로젝트에서 발생한 오류와 해결 방법을 기록합니다.

---

<!-- 형식:
## [YYYY-MM-DD] 오류 제목

### 증상
- 어떤 현상이 발생했는지

### 원인
- 근본 원인 분석

### 해결
- 적용한 해결 방법
-->

## [2026-02-18] Claude Code에서 `git push` 권한 거부 반복

### 증상
- Claude Code Bash 도구에서 `git push origin main` 실행 시 `Permission to use Bash with command ... has been denied.` 에러 반복 발생
- `git push`도 동일하게 거부됨
- commit, add 등 다른 git 명령어는 정상 동작

### 원인
- 글로벌 설정 (`~/.claude/settings.json`)에는 `Bash(git *)`로 전체 허용되어 있음
- 그러나 프로젝트 설정 (`.claude/settings.local.json`)의 `deny` 목록에 `Bash(git push *)`, `Bash(git push)`가 명시적으로 포함
- **프로젝트 레벨 deny가 글로벌 allow를 오버라이드**하여 차단됨
- 과거 세션에서 도구 승인 프롬프트에서 push를 한 번 거부하면, 해당 기록이 프로젝트 settings.local.json의 deny에 자동 저장되어 이후 세션에서도 계속 차단됨
- MCP나 세션 초기화와는 무관

### 해결
- `.claude/settings.local.json`에서 `deny` 배열의 `Bash(git push *)`, `Bash(git push)` 제거
- `allow` 배열에 `Bash(git push *)` 추가
- **재발 시**: `.claude/settings.local.json`의 deny 목록을 먼저 확인할 것
