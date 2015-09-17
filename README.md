# prototype-server

For starters, you need to register and start the database server,
which is located in the folder prototype-server\src\server\lib\orientdb\bin
for Windows server.bat, for other operating systems server.sh.

To start the server prototype must be installed node.js and run the server.js.
If the database is not created table "grid" you must wait until the message in the console "End create database."
To view the application, you need go to the browser at the address http://127.0.0.1:8000/.

To compile the changes to the prototype it is necessary to recompile the project. In the console enter the command: gulp