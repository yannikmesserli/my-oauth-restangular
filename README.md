# My Oauth enabled Restangular [![Build Status](https://travis-ci.org/yannikmesserli/my-oauth-restangular.png)](https://travis-ci.org/yannikmesserli/my-oauth-restangular)

Bower Component for a [Angularjs](https://angularjs.org/) service to provide authentification Oauth functions on top of [Restangular](https://github.com/mgonto/restangular).


## Usage
1. `bower install angular-markdown-directive`
2. Include `angular-markdown-directive.js`. It should be located at `bower_components/angular-markdown-directive/`.
3. Add `my.server` as a module dependency to your app:

```javascript
var app = angular.module('yourApp', [
  'my.server'
]);
```

4. Configure the `myServerProvider` in Angular with at least the `client_id` and `client_secret`:

```javascript
myServerProvider.setClientInfo("c09b28f394510c76b551", "439b384bb7ba832d1d76debc49cbf9d69e77d680");
```

3. Use `myServer` instead of Restangular when including the dependencies in Angular's controllers:

```javascript
var myCtrl = angular.module('yourApp').controller('MainCtrl', function ($scope, myServer) {});
```


## Options

You can configure the `myServerProvider`:

```javascript
var app = angular.module('yourApp', [
  'my.server'
])
.config(['myServerProvider', function (myServerProvider) {
	myServerProvider.setPort("8000");
  	myServerProvider.setBaseUrl("http://localhost");

  	// to customise the views:
    myServerProvider.set404Location("https://lcocalhost/#/error404");
    myServerProvider.setLoginLocation("https://lcocalhost/#/login");

}]);
```

## License
MIT
