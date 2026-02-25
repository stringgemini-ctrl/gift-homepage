---
description: run macOS notification after completing any code edit or build
---

// turbo-all

## 파일 수정만 한 경우 (Accept All 승인 필요 시)

After editing files without a build/deploy, run this command:

osascript -e 'tell app "System Events" to display dialog "GIFT AI: 파일 수정 완료 — 승인해주세요 (Accept All)" buttons {"확인"} default button 1 with title "GIFT AI 승인 대기"'

## 빌드/배포까지 완료한 경우

After a full build or git push deploy, run this command:

osascript -e 'tell app "System Events" to display dialog "GIFT AI: 빌드 및 배포가 완료되었습니다." buttons {"확인"} default button 1 with title "GIFT AI 작업 완료"'
