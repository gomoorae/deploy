const gameGrid = document.getElementById("gameGrid");

async function loadGames() {
  try {
    const res = await fetch("games.json");
    const games = await res.json();

    if (!Array.isArray(games) || games.length === 0) {
      gameGrid.innerHTML = "<p>���� ��ϵ� ������ �����ϴ�.</p>";
      return;
    }

    gameGrid.innerHTML = "";

    for (const game of games) {
      const card = document.createElement("a");
      card.className = "card";
      card.href = game.url;
      card.innerHTML = `
        <img class="thumb" src="${game.thumbnail}" alt="${game.title} �����" />
        <div class="meta">
          <h3>${game.title}</h3>
          <p>${game.description || ""}</p>
        </div>
      `;
      gameGrid.appendChild(card);
    }
  } catch (error) {
    gameGrid.innerHTML = `<p>���� ����� �ҷ����� ���߽��ϴ�: ${error.message}</p>`;
  }
}

loadGames();
