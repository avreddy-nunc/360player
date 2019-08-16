@ECHO OFF
:: This operation is for generating the JsDoc for the main.js file in thumbs folder using docdash template
TITLE My System Info
ECHO Please wait..
:: Generating Jsdoc
ECHO ============================
ECHO Generate JsDoc
ECHO ============================
jsdoc ./thumbs/js/main.js -t C:\Users\aravind\AppData\Roaming\npm\node_modules\docdash
ECHO Completed!