# README
Web FrontEnd for beer aggregator

# Web Frontend + Web backend
- NodeJS
- Express
- Bootstrap
- PUG (template engine)
- apache2 - nodeJS reverse proxy 

# Backend (Crawler, Search engine, Store)
- PySpider (Python spider framework) - docker IMG
- ElasticSearch [ES] (search engine) - docker IMG
- MogoDB (core data store) - docker IMG
- MySQL (crawler backend) - docker IMG
- RabbitMQ (crawler messaging) - docker IMG
- logstash (ES dataloader) - docker IMG

# Pull repo
git clone https://b-b-q@bitbucket.org/b-b-q/beeroteka.git
backend data https://yadi.sk/d/L654kqlU3TcFgL 

# Requirements
 - Docker https://docs.docker.com/install/
 - PySpider Dockerfile (build pyspider IMG)
 - PySpider docker-compose.yml (pyspider composer)
 - PySpider config.json
 - ES docker-compose.yml
 - ES data
 - MySQL data
 
# Install flow
1. install docker
2. pull repo and backend data
3. install Crawler (optional)
4. install NodeJS backend (ES + MongoDB)
5. run NodeJS backend containers
6. npm install NodeJS modules
7. run nodeJS 
8. Load data from ES to MongoDB 

# build PySpider Crawler IMG
1. cd pyspider
2. docker build -t crawler .
3. docker run --name revproxy -d -p 80:80 revproxy

# build Logstash dataloader IMG
1. cd logstash
2. docker build -t dataloader .

# run logstash (pickup data from MySQL and load to ES)
1. run mysql
2. run ES
3. docker run -it --rm -v "$PWD"/logstash/config-dir:/config-dir --link mysql:mysql --link elasticsearch:elasticsearch dataloader -f /config-dir/apivo-result2es.conf
4. docker run -it --rm -v "$PWD"/logstash/config-dir:/config-dir --link mysql:mysql --link elasticsearch:elasticsearch dataloader -f /config-dir/badvocate-result2es.conf

# build and run reverse proxy IMG
1. cd reverse_proxy
2. docker build -t revproxy .
3. docker run --name revproxy -d -p 80:80 revproxy

# build and run torbox
1. docker run --name torbox  -d -p 8118:8118 -p 9050:9050 rdsubhas/tor-privoxy-alpine
 
# Run backend Crawler components with COMPOSER (MySQL + RabbitMQ + PySpider framework)
1. docker run --name mysql -d -v /path/to/mysql_data/:/var/lib/mysql -e MYSQL_ALLOW_EMPTY_PASSWORD=yes mysql
2. docker run --name rabbitmq -d rabbitmq
3. docker run --name torbox  -d rdsubhas/tor-privoxy-alpine
4. sleep 20
5. docker-compose up

# Run backend Crawler components without COMPOSER 
1. docker run --name mysql -d -v /path/to/mysql_data/:/var/lib/mysql -e MYSQL_ALLOW_EMPTY_PASSWORD=yes mysql
2. docker run --name rabbitmq -d rabbitmq
3. docker run --name phantomjs -d crawler phantomjs
4. docker run --name result_worker -m 128m -d --link mysql:mysql --link rabbitmq:rabbitmq crawler result_worker
5. docker run --name processor -m 256m -d --link mysql:mysql --link rabbitmq:rabbitmq crawler processor
6. docker run --name fetcher -m 256m -d --link phantomjs:phantomjs --link rabbitmq:rabbitmq crawler fetcher --no-xmlrpc
7. docker run --name scheduler -d --link mysql:mysql --link rabbitmq:rabbitmq crawler scheduler
8. docker run --name webui -m 256m -d -p 5000:5000 --link mysql:mysql --link rabbitmq:rabbitmq --link scheduler:scheduler --link phantomjs:phantomjs crawler webui

# Run backend for NodeJS FrontEnd without COMPOSER (ElasticSearch + MongoDB)
1. docker run --name elasticsearch -d -p 9200:9200 -v "$PWD/elasticsearch/esdata":/usr/share/elasticsearch/data elasticsearch
2. docker run -d --name mongo -p 127.0.0.1:27017:27017 -p 127.0.0.1:28017:28017 -e MONGODB_USER="beeroteka" -e MONGODB_DATABASE="beeroteka" -e MONGODB_PASS="password" tutum/mongodb
