# Sử dụng image Nginx Alpine nhẹ nhàng
FROM nginx:alpine

# Xóa config default của nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy config nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy toàn bộ file trong thư mục hiện tại vào thư mục serve của Nginx
COPY . /usr/share/nginx/html

# Expose port 80 để truy cập
EXPOSE 80

# Chạy Nginx ở chế độ foreground
CMD ["nginx", "-g", "daemon off;"]
