self.onmessage = function (e) {
    
    var urls = e.data,
        done = urls.length,
        onload = function () {              
           // self.postMessage(this.response);          
            if (--done === 0) {     
                self.postMessage("complete");          
                self.close();
            }
        };

    urls.forEach(function (url) {
        var xhr = new XMLHttpRequest();
        xhr.onload = xhr.onerror = onload;       
        xhr.open('GET', url.src, true);
        xhr.responseType = 'blob';
        /*xhr.onloadstart = function(ev) {
            xhr.responseType = "blob";
        }*/
        xhr.send();
    });
};
