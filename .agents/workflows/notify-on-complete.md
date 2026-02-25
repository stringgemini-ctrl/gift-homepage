---
description: run macOS notification after completing any code edit or build
---

// turbo-all

## 파일 수정만 한 경우 (Accept All 승인 필요 시)

After editing files without a build/deploy, run this command so the user knows to approve:

osascript -e 'display notification "파일 수정을 마쳤습니다. 승인해주세요." with title "GIFT AI 승인 대기" sound name "Glass"'

## 빌드/배포까지 완료한 경우

After a full build or git push deploy, run this command:

osascript -e 'display notification "코드 수정 및 빌드가 완료되었습니다." with title "GIFT AI 작업 완료" sound name "Glass"'
