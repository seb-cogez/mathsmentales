@echo lancement du serveur MathsMentales
@echo ***************************************
@echo utilise RebexTinyWebServer, https://www.rebex.net/tiny-web-server/
@echo ***************************************
@echo off
echo demarrage de RebexTinyWeb
cd RebexTinyWebServer
start RebexTinyWebServer.exe
CHOICE /N /C:123 /M "Demarrer avec [1]Firefox / [2]Edge / [3]Chrome ?"%1
IF ERRORLEVEL ==3 goto chrom
IF ERRORLEVEL ==2 goto edge
IF ERRORLEVEL ==1 goto fire
goto end
:fire
@echo Lancement de firefox...
start firefox "http://127.0.0.1:1180/index.html"
goto end

:edge
@echo Lancement de Edge...
start msedge "http://127.0.0.1:1180/index.html"
goto end

:chrom
@echo Lancement de Chrome...
start chrome "http://127.0.0.1:1180/index.html"
goto end

:end
@echo ne pas fermer la fenetre. Appuyer sur la barre espace pour arreter MathsMentales.
pause
@echo Arret de RebexTinyWebServer
taskkill /IM RebexTinyWebServer.exe /F
pause