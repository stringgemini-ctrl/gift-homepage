---
description: run macOS notification after completing any code edit or build
---

// turbo-all

After completing any code edit, build, or task, run this command to send a macOS notification:

osascript -e 'display notification "코드 수정 및 빌드가 완료되었습니다." with title "GIFT AI 작업 완료" sound name "Glass"'
