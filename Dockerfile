# Use nginx to serve the static files
FROM nginx:alpine

# Copy the static files to nginx html directory
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# nginx runs in foreground by default
CMD ["nginx", "-g", "daemon off;"]
