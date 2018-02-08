# Node OAuth2 Server Implementation

<img alt="OAuth2" src="https://cdn.auth0.com/website/assets/pages/homepage/img/std_cert/oauth2-360e300bd3.svg" width="200">

Understand the basic of an oauth2 server

* [OAuth2 Server: Read The Docs](http://oauth2-server.readthedocs.io/en/latest/model/overview.html)
* [Which Grant?](https://oauth2.thephpleague.com/authorization-server/which-grant/)

### Fill up the database

```sh
mongoimport --db oauthtest --collection oauthaccesstokens --drop --file ./mongo-dump/oauthaccesstokens.json
mongoimport --db oauthtest --collection oauthauthorizationcodes --drop --file ./mongo-dump/oauthauthorizationcodes.json
mongoimport --db oauthtest --collection oauthclients --drop --file ./mongo-dump/oauthclients.json
mongoimport --db oauthtest --collection refreshtokens --drop --file ./mongo-dump/refreshtokens.json
mongoimport --db oauthtest --collection users --drop --file ./mongo-dump/users.json
```
