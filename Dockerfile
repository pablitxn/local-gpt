FROM nginx:alpine

COPY src/index.html /usr/share/nginx/html/index.html

COPY src/styles /usr/share/nginx/html/styles
COPY src/js /usr/share/nginx/html/js

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
