# Simple Game Showcase Site

소개 + 게임 썸네일 + 클릭 즉시 플레이만 있는 정적 웹사이트입니다.

## 현재 구조
```text
index.html
app.js
styles.css
games.json
games/
  tetris/index.html
  brick_breaker/index.html
thumbs/
  tetris.svg
  brick_breaker.svg
```

## 로컬에서 미리보기
아무 정적 서버로 열면 됩니다.

```bash
python -m http.server 5500
```
브라우저: `http://localhost:5500`

## GitHub Pages 배포
1. 이 폴더를 GitHub 저장소에 push
2. GitHub 저장소 -> `Settings` -> `Pages`
3. `Build and deployment`에서 `Source: Deploy from a branch`
4. `Branch: main` + `/ (root)` 선택 후 저장
5. 1~3분 뒤 배포 URL 접속

배포 URL 예시:
- 사용자 사이트: `https://<username>.github.io/`
- 프로젝트 사이트: `https://<username>.github.io/<repo-name>/`

## 게임 추가 방법
1. `games/새게임폴더/index.html` 추가
2. `thumbs/썸네일파일` 추가
3. `games.json`에 항목 추가

`games.json` 항목 예시:
```json
{
  "title": "My New Game",
  "description": "설명",
  "thumbnail": "thumbs/my_new_game.png",
  "url": "games/my_new_game/index.html"
}
```
