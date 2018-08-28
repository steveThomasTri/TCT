@echo off

node bulkregister/createcsv.js test

timeout /t 15 /nobreak

node bulkregister/insertrecords.js

timeout /t 15 /nobreak

node test/verify_players.js

timeout /t 5 /nobreak

node test/deleteplayers.js

pause

node test/updateskillrating.js