const gameGrid = document.getElementById("gameGrid");

async function loadGames() {
  try {
    const res = await fetch("games.json");
    const games = await res.json();

    if (!Array.isArray(games) || games.length === 0) {
      gameGrid.innerHTML = "<p>아직 등록된 게임이 없습니다.</p>";
      return;
    }

    gameGrid.innerHTML = "";

    for (const game of games) {
      const card = document.createElement("a");
      card.className = "card";
      card.href = game.url;
      card.innerHTML = `
        <img class="thumb" src="${game.thumbnail}" alt="${game.title} 썸네일" />
        <div class="meta">
          <h3>${game.title}</h3>
          <p>${game.description || ""}</p>
        </div>
      `;
      gameGrid.appendChild(card);
    }
  } catch (error) {
    gameGrid.innerHTML = `<p>게임 목록을 불러오지 못했습니다: ${error.message}</p>`;
  }
}

loadGames();
