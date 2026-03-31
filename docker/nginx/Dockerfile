FROM ubuntu:latest  
RUN apt-get update  
RUN apt-get install -y nginx  
# COPY ./conf/hosts/messenger.local.conf /etc/nginx/sites-enabled/messenger.local.conf
WORKDIR /data  
VOLUME /data  
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]