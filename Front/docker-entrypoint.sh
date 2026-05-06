#!/bin/sh
cat > /usr/share/nginx/html/env.js <<EOF
window['__env'] = { apiUrl: '${API_URL}' };
EOF
exec nginx -g 'daemon off;'
