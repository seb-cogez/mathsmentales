@echo lancement du serveur MathsMentales
@echo ***************************************
@echo utilise tinyweb, https://www.ritlabs.com/en/products/tinyweb/
@echo ***************************************
@echo off
SET _location=%CD%
SET _locMM=%_location:MathsMentales\=MathsMentales%
echo demarrage de tiny dans %_locMM%
start tinyweb-1-94\tiny.exe %_locMM% 8081
CHOICE /N /C:123 /M "Demarrer avec [1]Firefox / [2]Edge / [3]Chrome ?"%1
IF ERRORLEVEL ==3 goto chrom
IF ERRORLEVEL ==2 goto edge
IF ERRORLEVEL ==1 goto fire
goto end
:fire
@echo Lancement de firefox...
start firefox "http://127.0.0.1:8081/index.html"
goto end

:edge
@echo Lancement de Edge...
start msedge "http://127.0.0.1:8081/index.html"
goto end

:chrom
@echo Lancement de Chrome...
start chrome "http://127.0.0.1:8081/index.html"
goto end

:end
@echo ne pas fermer la fenetre. Appuyer sur la barre espace pour arreter MathsMentales.
pause
@echo Arret de tiny
taskkill /IM tiny.exe /F
pause