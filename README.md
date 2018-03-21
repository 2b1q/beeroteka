# README
**FrontEnd for beer aggregator**

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

# Requirements
 - PySpider Dockerfile (build pyspider IMG)
 - PySpider docker-compose.yml (pyspider composer)
 - PySpider config.json
 - ES docker-compose.yml
 - ES data
 - MySQL data
 
# Run backend Crawler components with COMPOSER (MySQL + RabbitMQ + PySpider framework)
1. docker run --name mysql -d -v /path/to/mysql_data/:/var/lib/mysql -e MYSQL_ALLOW_EMPTY_PASSWORD=yes mysql
2. docker run --name rabbitmq -d rabbitmq
3. sleep 20
4. docker-compose up

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
