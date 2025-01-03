@echo off

IF NOT EXIST "node_modules" (
    REM If "node_modules" does not exist, install node dependencies
    ECHO Node modules not found...
    ECHO Installing node modules dependencies...
    CALL npm i
    ECHO dependencies installed
)

CALL npm start