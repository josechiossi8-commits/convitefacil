(() => {
  const categories = {
    aniversario: ['festa','classic','neon','infantil','romantico','natureza','praia','minimalista','galaxia','floral','brisa','balada','arabesco'],
    infantil: ['infantil','festa','galaxia','praia','natal','halloween'],
    casamento: ['casamento','romantico','floral','natureza','classic','minimalista','brisa','arabesco','praia']
  };
  const tabs = [...document.querySelectorAll('.category')];
  const models = [...document.querySelectorAll('.theme')];
  const count = document.querySelector('.model-count');
  function updateCount() {
    const visible = models.filter(model => !model.hidden).length;
    const selected = models.find(model => model.getAttribute('aria-pressed') === 'true');
    const selection = selected && selected.hidden
      ? ` • Selecionado: ${selected.querySelector('.model-name').textContent.trim()} (fora desta categoria)`
      : '';
    count.textContent = `${visible} ${visible === 1 ? 'modelo' : 'modelos'} para você escolher${selection}`;
  }
  count.setAttribute('aria-live', 'polite');
  models.forEach(model => model.addEventListener('click', updateCount));
  tabs.forEach(tab => tab.addEventListener('click', () => {
    const category = tab.dataset.category;
    tabs.forEach(item => {
      const selected = item === tab;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    models.forEach(model => {
      const show = category === 'todos' || (categories[category] || []).includes(model.dataset.theme);
      model.hidden = !show;
    });
    updateCount();
  }));
})();
