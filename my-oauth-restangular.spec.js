describe('myServer', function () {
  var $compile,
      $rootScope;

  beforeEach(module('ngCookies'));
  beforeEach(module('restangular'));
  beforeEach(module('my.server'));


  it('should contain an myServer service', function () {
    module( function ( myServerProvider ) {
      myServerProvider.setClientInfo("c09b28f394510c76b551", "439b384bb7ba832d1d76debc49cbf9d69e77d680");
    });

    inject( function ( myServer ) {
      expect( myServer ).not.toBe(null);
    });
  });

});

