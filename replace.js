const fs = require('fs');
let b = fs.readFileSync('index.html', 'utf8');
b = b.replace(/<article\s+class="video-card([^"]*)"\s+data-id="([^"]+)"\s+onclick="([^"]+)"/g, '<a href="#$2" class="video-card$1" data-id="$2" onclick="$3; event.preventDefault();"');
b = b.replace(/<\/article>/g, '</a>');
fs.writeFileSync('index.html', b);
