# Simple Game Showcase Site

�Ұ� + ���� ����� + Ŭ�� ��� �÷��̸� �ִ� ���� ������Ʈ�Դϴ�.

## ���� ����
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

## ���ÿ��� �̸�����
�ƹ� ���� ������ ���� �˴ϴ�.

```bash
python -m http.server 5500
```
������: `http://localhost:5500`

## GitHub Pages ����
1. �� ������ GitHub ����ҿ� push
2. GitHub ����� -> `Settings` -> `Pages`
3. `Build and deployment`���� `Source: Deploy from a branch`
4. `Branch: main` + `/ (root)` ���� �� ����
5. 1~3�� �� ���� URL ����

���� URL ����:
- ����� ����Ʈ: `https://<username>.github.io/`
- ������Ʈ ����Ʈ: `https://<username>.github.io/<repo-name>/`

## ���� �߰� ���
1. `games/����������/index.html` �߰�
2. `thumbs/���������` �߰�
3. `games.json`�� �׸� �߰�

`games.json` �׸� ����:
```json
{
  "title": "My New Game",
  "description": "����",
  "thumbnail": "thumbs/my_new_game.png",
  "url": "games/my_new_game/index.html"
}
```
