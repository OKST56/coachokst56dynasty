# CoachOKST56Dynasty

Open index.html in a browser for the Missouri tracker and press.html for Zou Prairie Press. The site uses relative URLs and requires no build step.

## Updating the site

Edit data.js. Keep the season ID unique and put the newest season first. The imported roster is labeled Initial roster because the export did not specify a season year.

- **Games** go in schedule order. Fields are week, opponent, venue, result, and optionally article (the matching article ID). Leave result blank for a future game.
- **Stats** use stat, subject, and value.
- **Recruits** use name, position, stars, and status.
- **History** uses season, record, and finish.
- **Articles** use a unique URL-safe id, title, date in YYYY-MM-DD format, season label, summary, and paragraphs (an array of strings). Set featured to true to pin the story on the press page. An article ID of season-opener links as press.html#season-opener.

## Hosting

This folder is the root of the standalone okst56/coachokst56dynasty repository. Configure GitHub Pages to deploy from main and /(root).
