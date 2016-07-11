/*
 * my-oauth-restangular v0.3.1
 * (c) 2015 Yannik Messerli http://yannik-messerli.com
 * License: MIT
 */

'use strict';

(function() {
    angular.module('my.server', [ 'ngCookies', 'restangular'])

    .provider('myServer', function() {
        function serializeData( data ) { 
            // If this is not an object, defer to native stringification.
            if ( ! angular.isObject( data ) ) { 
                return( ( data == null ) ? "" : data.toString() ); 
            }

            var buffer = [];

            // Serialize each key in the object.
            for ( var name in data ) { 
                if ( ! data.hasOwnProperty( name ) ) { 
                    continue; 
                }

                var value = data[ name ];

                buffer.push(
                    encodeURIComponent( name ) + "=" + encodeURIComponent( ( value == null ) ? "" : value )
                ); 
            }

            // Serialize the buffer and clean it up for transportation.
            var source = buffer.join( "&" ).replace( /%20/g, "+" ); 
            return( source ); 
        }
        
        var o = {}

        // Private vars:
        var LOGIN_LOCATION = 'login', NOT_FOUND_LOCACTION = "error404",
        CLIENT_ID = '', CLIENT_SECRET = '', BASE_URL = '', PORT = '', TOKEN_PATH = "token";

        o.setClientInfo = function(clientId, clientSecret){
            CLIENT_ID = clientId;
            CLIENT_SECRET = clientSecret
        }
        o.setLoginLocation = function(login_url){
            LOGIN_LOCATION = login_url;
        }
        o.set404Location = function(not_found_view){
            NOT_FOUND_LOCACTION = not_found_view;
        }
        o.setPort = function(port){
            PORT = port;
        }
        o.setBaseUrl = function(base_url){
            BASE_URL = base_url;
        }
        o.setTokenPath = function(token_path){
            TOKEN_PATH = token_path;
        }


        function ServerException(message) {
           this.message = message;
           this.name = "ServerException";
        }



        o.$get = ['Restangular', '$location', '$cookieStore', function(Restangular, $location, $cookieStore){
            
            // Sanity checks:
            if( CLIENT_SECRET == '')
                throw new ServerException("Client secret not set");
            if (CLIENT_ID == '')
                throw new ServerException("Client id not set");

            // Interface for the provider:
            var Server = function(clientId, clientSecret, login_view, base_url, port, token_path) {

                if(port != "")
                    port = ":" + port;

                // Private method:

                // Redirect the user to the login form
                // if we get an authorize error:
                var interceptor = function(response, promise) {
                    //console.log(response, promise)
                    if ( response.status == 401 || response.status == 403) {
                        $location.path(login_view);
                        //window.location = "#/login"
                        return false;
                    };

                    if ( response.status == 404) {
                        console.log("test")

                        $location.path("error404");

                        //window.location = "#/login"
                        return false;
                    };
                    return '';
                },

                // Before each request, add the access token if we have it:
                // Don't enforce to have it. Instead catch unauthorize request from the server and 
                // redirect the user to the login form to create a new access token
                // The Server enforces the autorization.
                set_access_token = function(element, operation, what, url, headers, params){
                  
                  if($cookieStore.get("access_token")){
                    headers["Authorization"] = "Bearer " + $cookieStore.get("access_token");
                    return {
                      headers: headers
                    }
                  }else{
                    return {};
                  }
                },


                // Try to guess the URL:
                get_base_url = function(){
                    var absurl = "";
                    if(base_url == ""){
                        switch($location.port()){
                            case 9000:
                                absurl += $location.host();
                                break;
                            case 8000:
                                absurl += $location.host();
                                break;
                            default:
                                absurl += $location.host()
                                break;
                        }
                    }else{
                        absurl += base_url ;
                    }
                    return absurl + port + "/api/v1";
                },
                // console.log(get_base_url())
                //console.log($location.host(), $location.port());
                s = Restangular.withConfig(function(RestangularConfigurer) {
                    RestangularConfigurer.setBaseUrl(get_base_url());
                    RestangularConfigurer.setRequestSuffix('/?format=json');
                });


                s.get_base_url = get_base_url;
                s.addFullRequestInterceptor(set_access_token)
                s.setErrorInterceptor(interceptor);
                

                // Provide a common interface to login 
                // using the Oauth 2.0 - 2 peers protocol:
                s.authentificate = function(name, password, old_path){
                    var data = {
                        "client_id": clientId,
                        "client_secret": clientSecret,
                        "grant_type": "password",
                        "username": name,
                        "password": password
                    };
                    var exec = s.one('oauth2')
                    .customPOST(
                        serializeData(data), 
                        token_path, 
                        undefined, 
                        {'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8"}
                    );
                    exec.then(function(d){
                        // Setup the access_token            
                        $cookieStore.put("access_token",  d.access_token);
                        
                    });
                    return exec;
                }

                // To protect user, we need to delete the
                // token to avoid 
                s.logout = function(){
                    $cookieStore.remove('access_token');
                }

                // Return the object:
                return s;


            };

            return Server(CLIENT_ID, CLIENT_SECRET, LOGIN_LOCATION, BASE_URL, PORT, TOKEN_PATH);
        }];


        return o;
    });

})();

