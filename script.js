      const editorElement = document.getElementById('editor');
      const resultElement = document.getElementById('result');
      const undoElement = document.getElementById('undo');
      const redoElement = document.getElementById('redo');
      const clearElement = document.getElementById('clear');
      const convertElement = document.getElementById('convert');
      const latexElement = document.getElementById('latexArea');
      const fileReceiver = document.getElementById('fileReceiver');

	jQuery("input#fileReceiver").change(function () {
    	uploadFile()
	});

      editorElement.addEventListener('changed', (event) => {
        undoElement.disabled = !event.detail.canUndo;
        redoElement.disabled = !event.detail.canRedo;
        clearElement.disabled = event.detail.isEmpty;
      });

      function copyToClipboard() {
        var copyText = document.getElementById("latexArea");
        copyText.select();
        copyText.setSelectionRange(0, 99999);
        document.execCommand("copy");
        console.log("copied")
      }

      function toDataURL(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
          var reader = new FileReader();
          reader.onloadend = function() {
            callback(reader.result);
          }
          reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
      }

      async function translateImage(file) {
        console.log(file)
        var FR = new FileReader();
        try {
          FR.readAsDataURL(file);
        } catch (e){
          console.log(e)
          alert("Upload an appropriate file!")
        }
        

        FR.onload = function(e) {
          console.log(FR.result)
          $.ajax({
            url: "https://api.mathpix.com/v3/text",
            type: 'POST',
            dataType: 'application/json',
            headers: {
              "content-type": "application/json",
              "app_id": "victork03_naver_com_fb7598_0ad69a",
              "app_key": "ccaeef64880e00dcb475"
            },
            data: JSON.stringify({
              "src": FR.result , // only supports png for now.
              // "src": "https://mathpix.com/examples/limit.jpg",
              "formats": ["text", "data"],
              "data_options": {
                  "include_asciimath": false,
                  "include_latex": true
              }
            }),
            success: function (result) { // this doesn't work for some reason
              console.log("success....")
              var ans = JSON.parse(error.responseText).text
              console.log(error)
              latexElement.innerText = ans.slice(3, ans.length - 3);
            },
            error: function (error) { // this returns a correct input
              console.log("error.... but is working")
              var ans = JSON.parse(error.responseText).text
              console.log(error)
              latexElement.innerText = ""
              latexElement.innerText = ans.slice(3, ans.length - 3);
            }
          })
        }

        // console.log(FR);

        // await toDataURL(filePath, function(dataUrl) {
        //   console.log('RESULT:', dataUrl)
        //   $.ajax({
        //     url: "https://api.mathpix.com/v3/text",
        //     type: 'POST',
        //     dataType: 'application/json',
        //     headers: {
        //       "content-type": "application/json",
        //       "app_id": "victork03_naver_com_fb7598_0ad69a",
        //       "app_key": "ccaeef64880e00dcb475"
        //     },
        //     data: JSON.stringify({
        //       "src": dataUrl , // only supports png for now.
        //       // "src": "https://mathpix.com/examples/limit.jpg",
        //       "formats": ["text", "data"],
        //       "data_options": {
        //           "include_asciimath": false,
        //           "include_latex": true
        //       }
        //     }),
        //     success: function (result) { // this doesn't work for some reason
        //       console.log("success....")
        //       console.log(JSON.stringify(data).responseText.text);
        //     },
        //     error: function (error) { // this returns a correct input
        //       console.log("error.... but is working")
        //       var ans = JSON.parse(error.responseText).text
        //       latexElement.innerText = ans.slice(3, ans.length - 3);
        //     }
        //   })
        // })
      }

      function uploadFile() {
        console.log(fileReceiver.files[0]);
        translateImage(fileReceiver.files[0]);
      }

      // async function getBase64(file, cb) {
      //   let reader = new FileReader();
      //   reader.onload = function() {
      //     cb(reader.result);
      //   };
      //   reader.onerror = function(error) {
      //     console.log("error", error)
      //   }
      // }

      // async function imageToLatex(file) {
      //   try {
      //     await getBase64(file, (base64string) =>{
      //       fetch("https://api.mathpix.com/v3/text", {
      //         method: "POST",
      //         headers: {
      //           "content-type": "application/json",
      //           "app_id": "victork03_naver_com_fb7598_0ad69a",
      //           "app_key": "ccaeef64880e00dcb475"
      //         },
      //         body: JSON.stringify({
      //           "src": base64string,
      //           "formats": ["text", "data", "html"],
      //           "data_options": {
      //               "include_asciimath": false,
      //               "include_latex": true
      //           }
      //         })
      //       })
      //       .then((res) => res.json())
      //       .then((response) => console.log(response))
      //     })
      //   } catch(e) {
      //     console.log("error!");
      //     console.log(e.message);
      //   }
      //   // Tesseract.recognize(
      //   //   'ee.png',
      //   //   'eng',
      //   //   { logger: m => console.log(m) }
      //   // ).then(({ data: { text } }) => {
      //   //   console.log(text);
      //   //   console.log(tessTranslate(text));
      //   //   latexElement.innerText = convertText(tessTranslate(text));
      //   // })
      // }

      function cleanLatex(latexExport) {
        if (latexExport.includes('\\\\')) {
          const steps = '\\begin{align*}' + latexExport + '\\end{align*}';
          return steps.replace("\\begin{aligned}", "")
            .replace("\\end{aligned}", "")
            .replace(new RegExp("(align.{1})", "g"), "aligned");
        }
        return latexExport
          .replace(new RegExp("(align.{1})", "g"), "aligned");
      }

      editorElement.addEventListener('exported', (evt) => {

        const exports = evt.detail.exports;
        if (exports && exports['application/x-latex']) {
          convertElement.disabled = false;
          katex.render(cleanLatex(exports['application/x-latex']),  resultElement);
          /////////////////////////////////////////////////////////////////////////////
          latexElement.innerText = ""
          latexElement.innerText = convertText(cleanLatex(exports['application/x-latex']));

        } else if (exports && exports['application/mathml+xml']) {
          convertElement.disabled = false;
          resultElement.innerText = exports['application/mathml+xml'];
        } else if (exports && exports['application/mathofficeXML']) {
          convertElement.disabled = false;
          resultElement.innerText = exports['application/mathofficeXML'];
        } else {
          convertElement.disabled = true;
          resultElement.innerHTML = '';
        }
      });
      undoElement.addEventListener('click', () => {
        editorElement.editor.undo();
      });
      redoElement.addEventListener('click', () => {
        editorElement.editor.redo();
      });
      clearElement.addEventListener('click', () => {
        editorElement.editor.clear();
      });
      convertElement.addEventListener('click', () => {
        editorElement.editor.convert();
      });

      /**
       * Attach an editor to the document
       * @param {Element} The DOM element to attach the ink paper
       * @param {Object} The recognition parameters
       */
      iink.register(editorElement, {
        recognitionParams: {
          type: 'MATH',
          protocol: 'WEBSOCKET',
          server: {
            scheme: 'https',
            host: 'webdemoapi.myscript.com',
            applicationKey: 'b53ffeef-f08c-4d83-ab14-024ac1f2f1b0',
            hmacKey: '3e851107-52c0-4bf3-a513-cf5777a65d35'
          },
          iink: {
            math: {
              mimeTypes: ['application/x-latex', 'application/vnd.myscript.jiix']
            },
            export: {
              jiix: {
                strokes: true
              }
            }
          }
        }
      });

      window.addEventListener('resize', () => {
        editorElement.editor.resize();
      });

      function convertText(latexText) {
        console.log(latexText)
        ans = ""
        components = latexText.split("\\")
        for(var i = 0; i < components.length; i++) {
          if(components[i].slice(0, 5) == "dfrac"){
            ans += "\\frac"
            ans += components[i].slice(5)
          } else if(components[i].slice(0, 4) == "left") {
            ans += "\\left"
            ans += components[i].slice(4)
          } else if(components[i].slice(0, 5) == "right"){
            ans += "\\right"
            ans += components[i].slice(5)
          } else {
            ans += ("\\" + components[i])
          }
        }
        console.log(ans)
        return ans.slice(1) // first slash shouldn't count.
      }