ReqX
==============

A library for simplifying jQuery AJAX calls while emulating the use of Express module for Node.js with built in synchronous, asynchronous and recursive request handlers.

Examples
==============

Make a GET request
--------------
```javascript
// Start GET request
ReqX().get('/resource', function(err, result){
    // Check for error
    if(err) return alert(err);
    // Alert response
    alert(result);
});
```

Make a POST request
--------------
```javascript
// Start POST request
ReqX().post('/resource', { data: 'example' }, function(err, result){
    // Check for error
    if(err) return alert(err);
    // Alert response
    alert(result);
});
```

Chaining requests with a done callback
--------------
```javascript
// Start a POST request
ReqX().post('/stats', { 'auth': 'authorization-key' }, function(err, result){
    if(err) return;
    drawStats(result);
// Start a GET request
}).get('/template/heading.html', function(err, result){
    if(err) return;
    $('#Target').html(result);
// Setup done callback
}).done(function(errors){
    // Check errors array
    if(errors) return handleErrors(errors);
    // Do something when it's all done
    $('#Conatainer').show();
});
```

Synchronous request
--------------
```javascript
// Setup synchronous mode
ReqX().post('/stats', { 'auth': 'authorization-key' }, function(err, result){
    if(err) return;
    drawStats(result);
// Start a GET request
}).get('/template/heading.html', function(err, result){
    if(err) return;
    $('#Target').html(result);
// Setup done callback
}).done(function(errors){
    // Check errors array
    if(errors) return handleErrors(errors);
    // Do something when it's all done
    $('#Conatainer').show();
});
```
Just set option ```{ sync: true }``` and each request in the chain will be handled synchronously.

Docs
==============

ReqX().post()
--------------

.post() is a simple POST request handler designed to be easy and fast to program.

Arguments  | Required | Type 
------------- | ------------- | ------------- 
URL  | no | string 
Data  | no | object 
Callback  | no | function 
```javascript
ReqX().post(url, data, callback);
```

Example:
```javascript
ReqX().get('/resource', function(err, result){
    // Handle error
    if(err) return alert(err);
    // Do something with result
    alert(result);
});
```

ReqX().put()
--------------

.put() is a simple PUT request handler designed to be easy and fast to program.

Arguments  | Required | Type
------------- | ------------- | -------------
URL  | no | string
Data  | no | object
Callback  | no | function
```javascript
ReqX().get(url, data, callback);
```

Example:
```javascript
ReqX().post('/resource', { data: 'example' }, function(err, result){
    // Handle error
    if(err) return alert(err);
    // Do something with result
    alert(result);
});
```

ReqX().get()
--------------

.get() is a simple GET request handler designed to be easy and fast to program.

Arguments  | Required | Type 
------------- | ------------- | ------------- 
URL  | no | string 
Data  | no | object 
Callback  | no | function 
```javascript
ReqX().get(url, data, callback);
```

Example:
```javascript
ReqX().post('/resource', { data: 'example' }, function(err, result){
    // Handle error
    if(err) return alert(err);
    // Do something with result
    alert(result);
});
```

ReqX().ajax()
--------------

.ajax is versatile request handler designed to be more programmable and support all methods, a little more advanced than .post() or .get().

Arguments  | Required | Type | default 
------------- | ------------- | ------------- | ------------- 
URL  | no | string | window.location.href 
Method  | no | string | 'GET' 
Data  | no | object | {} 
Callback  | no | function | null
```javascript
ReqX().ajax(url, method, data, callback);
```

Example:
```javascript
ReqX().ajax('/resource', 'GET', { data: 'example' }, function(err, result){
    // Handle error
    if(err) return alert(err);
    // Do something with result
    alert(result);
});
```

ReqX().done()
--------------
.done() is a callback setter ready to attach to any request chain.

Arguments  | Required | Type 
------------- | ------------- | ------------- 
Callback  | yes | function 
```javascript
ReqX().done(callback);
```

Example:
```javascript
ReqX().post('/resource', { data: 'example' }, function(err, result){
    if(err) return alert(err);
    handleResult(result);
}).get('/template', function(err, result){
    if(err) return alert(err);
    append(result);
}).done(function(errors){
    if(error) return handleErrors(errors);
    $('#Template').show();
});
```

ReqX().error()
--------------

.error() is a error callback setter ready to attach to any request chain.

Arguments  | Required | Type 
------------- | ------------- | ------------- 
Callback  | yes | function 
```javascript
ReqX().error(callback);
```

Example:
```javascript
ReqX().post('/resource', { data: 'example' }, function(err, result){
    if(err) return alert(err);
    handleResult(result);
}).get('/template', function(err, result){
    if(err) return alert(err);
    append(result);
}).error(function(err){
    handleError(err);
}).done(function(){
    $('#Template').show();
});
```

ReqX(config) options
--------------

When initing ReqX you can pass an options object for configuring that instance of ReqX.

Options | Default | Description | Example 
------------- | ------------- | ------------- | ------------- 
Synchronous  | false | Enable synchronous request handler | ReqX({ sync: true })
Caching  | false | Enable caching on requests | ReqX({ cache: true })
Accepts  | undefined | Set accepts | ReqX({ accpets: 'json' })
Data Type  | undefined | Set data type | ReqX({ dataType: 'json' })
Content Type  | undefined | Set content type | ReqX({ contentType: 'json' })
JSON mode | undefined | Sends request as JSON | ReqX({ json: true })
Default Method  | 'GET' | Set default method for ReqX().ajax() | ReqX({ default_method: 'POST' })

Callback function(err, result, again){}
--------------

Each request handler within ReqX have an optional callback that contains 3 arguments: err, result and again.

Argument | Name | Description 
------------- | ------------- | ------------- 
1  | Error | If an error is ecountered with a request it will be stored in the first argument of the callback. If no error the first argument will be ```null```. 
2  | Result | If the request was successful the response will be stored in the second argument of the callback. 
3  | Again | The third argument of the callback contains a helper function for recursive requests. Call the third argument as a function to call the current request again.

Example:
```javascript
ReqX().post('/resource', { data: 'example' }, function(err, result, again){
    // if err return and throw
    if(err) return alert(err);
    // !err process result
    if(result.status){
        alert('Done!');
    }else{
        // Call this request again
        again();
    } 
});
```
