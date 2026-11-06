'use strict';

const byId = id => document.getElementById(id);
const node = (tag, value) => {
  const element = document.createElement(tag);
  element.textContent = value;
  return element;
};

function table(id, columns, rows, emptyMessage) {
  const target = byId(id);
  if (!rows.length) {
    const empty = node('p', emptyMessage);
    empty.className = 'empty';
    target.replaceChildren(empty);
    return;
  }

  const wrapper = node('div', '');
  wrapper.className = 'table-wrap';
  const grid = node('table', '');
  const header = grid.createTHead().insertRow();
  for (const label of columns) {
    const cell = node('th', label);
    cell.scope = 'col';
    header.append(cell);
  }
  const body = grid.createTBody();
  for (const values of rows) {
    const row = body.insertRow();
    for (const value of values) {
      const cell = row.insertCell();
      if (value instanceof Node) cell.append(value);
      else cell.textContent = value ?? '—';
    }
  }
  wrapper.append(grid);
  target.replaceChildren(wrapper);
}

function link(url, label) {
  const anchor = node('a', label);
  anchor.href = url;
  return anchor;
}

function setupTracker() {
  const picker = byId('season');
  const search = byId('search');
  const unit = byId('unit');
  for (const season of dynasty.seasons) picker.add(new Option(season.label, season.id));

  function renderRoster() {
    const season = dynasty.seasons.find(entry => entry.id === picker.value);
    const query = search.value.trim().toLowerCase();
    const players = season.players.filter(player =>
      (!unit.value || player.unit === unit.value) &&
      [player.name, player.position, player.hometown, String(player.number)]
        .some(value => value.toLowerCase().includes(query))
    );
    byId('count').textContent = players.length + ' of ' + season.players.length + ' players';
    table('players', ['#', 'Player', 'Pos.', 'Class', 'OVR', 'Dev', 'Hometown'],
      players.map(p => [p.number, p.name, p.position, p.year, p.overall, p.development, p.hometown]),
      'No players match this filter.');
  }

  function renderSeason() {
    const season = dynasty.seasons.find(entry => entry.id === picker.value);
    unit.replaceChildren(new Option('All units', ''));
    for (const name of new Set(season.players.map(player => player.unit))) unit.add(new Option(name, name));
    const latest = season.games.filter(game => game.result).at(-1);
    const next = season.games.find(game => !game.result);
    byId('latest').textContent = latest ? latest.opponent + ' · ' + latest.result : 'No results recorded yet.';
    byId('next').textContent = next ? next.opponent + ' · ' + next.week : 'No matchup scheduled yet.';
    table('games', ['Week', 'Opponent', 'Venue', 'Result', 'Recap'],
      season.games.map(g => [g.week, g.opponent, g.venue, g.result,
        g.article ? link('press.html#' + encodeURIComponent(g.article), 'Read recap') : '—']),
      'No games recorded for this season.');
    table('stat-data', ['Stat', 'Team or player', 'Value'],
      season.stats.map(s => [s.stat, s.subject, s.value]), 'No stats recorded for this season.');
    table('recruits', ['Recruit', 'Pos.', 'Stars', 'Status'],
      season.recruits.map(r => [r.name, r.position, r.stars, r.status]), 'No recruits recorded for this season.');
    renderRoster();
  }

  table('archives', ['Season', 'Record', 'Finish'],
    dynasty.history.map(h => [h.season, h.record, h.finish]), 'Completed seasons will appear here.');
  picker.addEventListener('change', renderSeason);
  search.addEventListener('input', renderRoster);
  unit.addEventListener('change', renderRoster);
  renderSeason();
}

function setupPress() {
  const press = byId('press');
  if (!dynasty.articles.length) {
    const section = node('section', '');
    const message = node('p', 'Game recaps and dynasty stories will appear here as they are published.');
    message.className = 'empty';
    section.append(node('h2', 'Article archive'), message);
    press.append(section);
    return;
  }

  const articles = [...dynasty.articles].sort((a, b) => b.date.localeCompare(a.date));
  const featured = articles.find(article => article.featured) ?? articles[0];
  const feature = node('section', '');
  const label = node('p', 'FEATURED STORY');
  label.className = 'eyebrow';
  const title = node('h2', '');
  title.append(link(featured.url ?? '#' + encodeURIComponent(featured.id), featured.title));
  feature.append(label, title, node('p', featured.summary));
  press.append(feature, node('h2', 'Article archive'));

  for (const season of new Set(articles.map(article => article.season))) {
    const section = node('section', '');
    section.append(node('h3', season));
    for (const story of articles.filter(article => article.season === season)) {
      const article = node('article', '');
      article.id = story.id;
      article.className = 'story';
      const heading = node('h4', '');
      heading.append(link(story.url ?? '#' + encodeURIComponent(story.id), story.title));
      if (story.url) {
        article.append(node('p', story.edition || story.date), heading, node('p', story.summary));
        section.append(article);
        continue;
      }
      const date = node('time', story.date);
      date.dateTime = story.date;
      article.append(date, heading, ...story.paragraphs.map(paragraph => node('p', paragraph)));
      section.append(article);
    }
    press.append(section);
  }
  if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
}

if (byId('season')) setupTracker();
if (byId('press')) setupPress();
