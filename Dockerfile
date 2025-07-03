FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY index.html /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
COPY favicon.svg /usr/share/nginx/html/

RUN ln -s /usr/share/nginx/html/favicon.svg /usr/share/nginx/html/favicon.ico

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
