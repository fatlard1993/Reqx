(function(win){
	var DBG = false;

	var Log = DBG ? console.error : function noop(){};

	function mergeObject(){
		var out = {};

		for(var x = 0; x < arguments.length; ++x){
			for(var y in arguments[x]){
				if(arguments[x].hasOwnProperty(y)){
					var k = arguments[x][y];

					if(!(k instanceof Element) &&(typeof k === 'object' && !Array.isArray(k))) k = mergeObject(out[y], k);

					out[y] = k;
				}
			}
		}
		return out;
	}

	function Reqx(opts){
		if(!(this instanceof Reqx)){
			var err = 'Class constructor Reqx cannot be invoked without "new"';

			if(typeof window.TypeError === 'function') err = new TypeError(err);

			throw err;
		}

		this.opts = mergeObject(Reqx.defaults_options, opts);

		// Setup JSON request
		if(this.opts.mode) this.opts.headers = mergeObject(Reqx.default_headers[this.opts.mode], this.opts.headers);

		return this;
	}

	Reqx.prototype.request = function(opts, callback){
		var xhr = Reqx.getXHR();

		xhr.addEventListener('load', function(){
			if(this.status >= 400){
				callback({
					message: 'The server returned a status code of '+ this.status,
					name: 'HTTP Error',
					status: this.status
				});

				return;
			}
			callback(null, this.responseText);
		});

		xhr.addEventListener('error', function(){
			callback({
				message: 'Failed to connect to '+ opts.url,
				name: 'Connection Failed'
			});
		});

		opts = mergeObject(this.opts, opts);

		if(opts.data) Reqx.preparePayload(opts);

		xhr.withCredentials = opts.withCredentials;

		xhr.open(opts.method, opts.url, true);

		if(opts.headers) Reqx.setHeaders(xhr, opts.headers);

		xhr.send(opts.data);

		return xhr;
	};

	Reqx.defineMethod = function(name){
		var lowerCaseName = name.toLowerCase();

		Reqx.prototype[lowerCaseName] = function(url, data, callback){
			if(typeof data === 'function'){
				callback = data;
				data = undefined;
			}

			var retries = arguments[3];
			var _self = this;
			var xhr = this.request({
				url: url,
				data: data,
				method: name
			}, function(err, body){
				if(_self.opts.parse){
					body = Reqx.parseResponse(xhr);
				}

				if(err){
					if(_self.opts.retry && !retries){
						retries = Reqx.defaults_options.slice();
					}

					if(retries && retries.length){
						Log(err);

						setTimeout(function(){
							_self[lowerCaseName](url, data, callback, retries);
						}, retries.shift() * 1000);

						return;
					}

					err.body = body;

					callback(err, null);

					return;
				}

				callback(null, body);
			});

			return xhr;
		};
	};

	Reqx.getXHR = function(){
		if(win.ActiveXObject) return new win.ActiveXObject('Microsoft.XMLHTTP');// Ancient browser

		return new win.XMLHttpRequest();// Modern browser
	};

	Reqx.preparePayload = function(opts){
		if(opts.method === 'GET' && opts.data){
			opts.url +=('?'+ Reqx.toQueryString(opts.data));

			delete opts.data;

			return opts;
		}

		if(opts.mode === 'json' && typeof opts.data === 'object'){
			opts.data = JSON.stringify(opts.data);

			return opts;
		}

		if(opts.mode === 'form'){
			if(opts.data instanceof Element) opts.data = new FormData(opts.data);

			else if(typeof opts.data === 'object') opts.data = Reqx.toFormData(opts.data);

			return opts;
		}

		if(opts.mode === 'urlencoded') opts.data = Reqx.toQueryString(opts.data);

		return opts;
	};

	Reqx.parseResponse = function(xhr){
		var headers = Reqx.parseHeaders(xhr.getAllResponseHeaders());
		var contentType = headers['content-type'];
		var body = xhr.responseText;

		if(contentType && ~contentType.indexOf('json')){
			try{
				return JSON.parse(body);
			}

			catch(err){
				Log({
					message: 'Failed to parse response as JSON',
					name: 'Parser Error'
				});
			}
		}

		if(xhr.responseXML) return xhr.responseXML;

		return body;
	};

	Reqx.parseHeaders = function(rawHeaders){
		var out = {};
		var headers = rawHeaders.split(Reqx.regex.line_return), header;
		var length = headers.length;

		for(var x = 0; x < length; ++x){
			header = headers[x].match(Reqx.regex.header);

			if(header) out[header[1].toLowerCase()] = header[2];
		}

		return out;
	};

	Reqx.parseQueryString = function(queryString){
		queryString = (queryString || document.location.search).replace(Reqx.regex.query_string, '');

		var out = {};
		var params = queryString.split('&');

		for(var x = 0; x < params.length; ++x){
			var keyVal = params[x].split('=');

			out[keyVal[0]] = keyVal[1];
		}

		return out;
	};

	Reqx.setHeaders = function(xhr, headers){
		if(!headers) return;

		for(var header in headers){
			if(headers.hasOwnProperty(header)) xhr.setRequestHeader(header, headers[header]);
		}
	};

	Reqx.toFormData = function(data){
		var form = new FormData();

		for(var prop in data){
			if(data.hasOwnProperty(prop)) form.append(prop, data[prop]);
		}

		return form;
	};

	Reqx.toQueryString = function(params){
		var out = '';

		for(var prop in params){
			if(params.hasOwnProperty(prop)){
				if(out) out += '&';

				out += (encodeURIComponent(prop) +'='+ encodeURIComponent(params[prop]));
			}
		}

		return out;
	};

	Reqx.defaults_options = {
		method: 'GET',
		mode: 'json',
		parse: true,
		retry: false,
		retryStrategy: [0.2, 2, 8],
		withCredentials: false
	};

	Reqx.default_headers = {
		json: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		xml: {
			'Content-Type': 'application/xml',
			Accept: 'application/xml'
		},
		form: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: 'application/json, /'
		},
		urlencoded: {
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: 'application/json, /'
		}
	};

	Reqx.default_methods = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'TRACE', 'OPTIONS'];

	Reqx.version = '2.0.1';

	Reqx.regex = {
		header: /([^:]*):\s?(.+)/,
		line_return: /\r?\n|\r/gm,
		query_string: /^.*?\?/
	};

	for(var x = 0; x < Reqx.default_methods.length; ++x){
		Reqx.defineMethod(Reqx.default_methods[x]);
	}

	win.Reqx = Reqx;
})(window);