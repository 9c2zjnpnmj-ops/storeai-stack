const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initDirectory() {
  const search = $("#tool-search");
  const category = $("#category-filter");
  const cards = $$(".tool-card");
  if (!search || !category || cards.length === 0) return;

  const apply = () => {
    const q = search.value.trim().toLowerCase();
    const cat = category.value;
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const matchText = !q || text.includes(q);
      const matchCat = cat === "all" || card.dataset.category === cat;
      card.style.display = matchText && matchCat ? "" : "none";
    });
  };
  search.addEventListener("input", apply);
  category.addEventListener("change", apply);
}

function initMatcher() {
  const root = $("#tool-matcher");
  if (!root || !window.matcherData) return;
  const buttons = $$(".matcher-options button", root);
  const output = $("#matcher-output", root);
  const render = (id) => {
    const useCase = window.matcherData.find((item) => item.id === id) || window.matcherData[0];
    buttons.forEach((button) => button.classList.toggle("active", button.dataset.usecase === useCase.id));
    output.innerHTML = useCase.tools.map((tool) => `
      <a class="card" href="${tool.url}">
        <h3>${tool.name}</h3>
        <p>${tool.summary}</p>
        <div class="tag-row">${tool.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
      </a>
    `).join("");
  };
  buttons.forEach((button) => button.addEventListener("click", () => render(button.dataset.usecase)));
  render(buttons[0]?.dataset.usecase);
}

initDirectory();
initMatcher();
