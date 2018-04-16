# README
Web FrontEnd for beer aggregator.
Beer search and crawl engine.

# Main components
- NodeJS Web frontend
- NodeJS backend (data store & elasticsearch engine)
- Dataloader (From Crawler to ES)
- Crawler (PySpider framework)

## Web FrontEnd + Web BackEnd (WFE + WBE) 
- NodeJS (WBE)
- Express (WBE)
- Bootstrap (WFE component library)
- PUG (template engine)
- revproxy docker IMG - apache2 reverse proxy based on alpine linux (proxing TCP:80 => TCP:3000)

## Backend (Crawler, Search engine, Store, dataloader)
- PySpider (Python spider framework) - docker IMG
- ElasticSearch [ES] (search engine) - docker IMG
- MogoDB (core data store) - docker IMG
- MySQL (crawler backend) - docker IMG
- RabbitMQ (crawler messaging) - docker IMG
- logstash (ES dataloader) - docker IMG

## Pull repo
1. git clone https://b-b-q@bitbucket.org/b-b-q/beeroteka.git
2. Load backend data https://yadi.sk/d/L654kqlU3TcFgL 

## Requirements
### Crawler Requirements
 - Docker https://docs.docker.com/install/
 - PySpider Dockerfile (build pyspider IMG)
 - PySpider docker-compose.yml (pyspider composer)
 - PySpider config.json
 - MySQL data 
 - torbox
 
### dataloader Requirements
 - Docker https://docs.docker.com/install/
 - MySQL container
 - MySQL data (mysql_data.tar.gz)
 - ES container
 - ES data (esdata.tar.gz)
 - logstash container 
 - logstash configs (logstash.tar.gz)
 
### NodeJS Web FrontEnd Requirements
- Docker https://docs.docker.com/install/
- ES container (see "Run backend for NodeJS")
- MongoDB container (see "Run backend for NodeJS")
- ES data (esdata.tar.gz)
- git NodeJS repo
 
## Install flow
1. install docker and docker composer
2. pull repo and backend data
3. install Crawler (optional)
4. install NodeJS backend (ES + MongoDB)
5. run NodeJS backend containers
6. npm install NodeJS modules
7. run nodeJS 
8. Load data from ES to MongoDB 

## Build docker images
### build PySpider Crawler IMG (optional)
```
1. cd pyspider
2. docker build -t crawler .
3. docker run --name revproxy -d -p 80:80 revproxy
```
### build Logstash dataloader IMG (optional)
```
1. cd logstash
2. docker build -t dataloader .
```
### build and run reverse proxy IMG (optional)
```
1. cd reverse_proxy
2. docker build -t revproxy .
3. docker run --name revproxy -d -p 80:80 revproxy
```
### build and run torbox (optional)
```
docker run --name torbox  -d -p 8118:8118 -p 9050:9050 rdsubhas/tor-privoxy-alpine
```
## RUN components with COMPOSER
### Run backend Crawler components (MySQL + RabbitMQ + PySpider framework) (optional)
```
1. docker run --name mysql -d -v /path/to/mysql_data/:/var/lib/mysql -e MYSQL_ALLOW_EMPTY_PASSWORD=yes mysql
2. docker run --name rabbitmq -d rabbitmq
3. docker run --name torbox  -d rdsubhas/tor-privoxy-alpine
4. sleep 20
5. docker-compose up
```
### Run ES with composer
```
1. cd es
2. docker-compose up
```
## RUN components without COMPOSER
### Run backend Crawler components (optional)
```
1. docker run --name mysql -d -v /path/to/mysql_data/:/var/lib/mysql -e MYSQL_ALLOW_EMPTY_PASSWORD=yes mysql
2. docker run --name rabbitmq -d rabbitmq
3. docker run --name phantomjs -d crawler phantomjs
4. docker run --name result_worker -m 128m -d --link mysql:mysql --link rabbitmq:rabbitmq crawler result_worker
5. docker run --name processor -m 256m -d --link mysql:mysql --link rabbitmq:rabbitmq crawler processor
6. docker run --name fetcher -m 256m -d --link phantomjs:phantomjs --link rabbitmq:rabbitmq crawler fetcher --no-xmlrpc
7. docker run --name scheduler -d --link mysql:mysql --link rabbitmq:rabbitmq crawler scheduler
8. docker run --name webui -m 256m -d -p 5000:5000 --link mysql:mysql --link rabbitmq:rabbitmq --link scheduler:scheduler --link phantomjs:phantomjs crawler webui
```
### Run backend for NodeJS FrontEnd (ElasticSearch + MongoDB)
```
1. docker run --name elasticsearch -d -p 9200:9200 -v "$PWD/elasticsearch/esdata":/usr/share/elasticsearch/data elasticsearch
2. docker run -d --name mongo -p 127.0.0.1:27017:27017 -p 127.0.0.1:28017:28017 -e MONGODB_USER="beeroteka" -e MONGODB_DATABASE="beeroteka" -e MONGODB_PASS="password" tutum/mongodb
```
### run logstash (pickup data from MySQL and load to ES) (optional)
1. run mysql
2. run ES
3. load data from MySQL to ES
```
docker run -it --rm -v "$PWD"/logstash/config-dir:/config-dir --link mysql:mysql --link elasticsearch:elasticsearch dataloader -f /config-dir/apivo-result2es.conf
docker run -it --rm -v "$PWD"/logstash/config-dir:/config-dir --link mysql:mysql --link elasticsearch:elasticsearch dataloader -f /config-dir/badvocate-result2es.conf
```

## Backups
### backup MySQL crawler data
```
docker exec mysql /usr/bin/mysqldump -u root resultdb > /tmp/resultdb.sql && gzip -f /tmp/resultdb.sql
docker exec mysql /usr/bin/mysqldump -u root projectdb > /tmp/projectdb.sql && gzip -f /tmp/projectdb.sql
docker exec mysql /usr/bin/mysqldump -u root taskdb > /tmp/taskdb.sql && gzip -f /tmp/taskdb.sql
```
## ES hints
### show ES indexes
```
1. export ES_URL=localhost:9200
2. curl $ES_URL/_cat/indices?v
```
### show mappings
```
curl -XGET "$ES_URL/ES_index/_mapping?pretty" # check mappings in resultdb index
```
## Docker 
#### delete All unused volumes
```
docker volume rm $(docker volume ls -qf dangling=true)
```
#### drop all containers
```
docker rm $(docker ps -a|awk '($1 !~ /CONTAINER/){ print $1}')
```
#### drop crawler containers 
```
docker rm -f  $(docker ps -a|grep -i crawler|awk '{print $1}')
```
#### read container logs
```
docker logs <container_name> 
```
#### inspect container
```
docker inspect mysql
docker logs mysql
```
#### Short docker PS output
```
docker ps --format "table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Names}}"
```
#### build crawler from current dir with Dockerfile
```
docker build -t crawler .
```
## Grunt 
#### Installing
```
1. npm install -g grunt-cli        # Installing the CLI globally
2. npm install grunt --save-dev    # add GRUNT to devDependencies
```
#### Add gruntplugins
```
npm install grunt-contrib-uglify --save-dev     # Minify/uglify JS
npm install grunt-contrib-concat --save-dev     # Concat JS
npm install load-grunt-tasks --save-dev         # Load all grunt-* packages from package.json
npm install time-grunt --save-dev               # Display the elapsed execution time of grunt tasks
```
#### Run grunt tasks
```
grunt
```