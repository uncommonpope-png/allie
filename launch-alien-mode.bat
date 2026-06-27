@echo off
title GSK ALIEN MODE — Main Console
cd /d C:\Users\uncom\Desktop\allie
set ALLIE_API_KEY=allie-test-key-2026
set ALLIE_BSKY_IDENTIFIER=allieboughtasoul.bsky.social
set ALLIE_BSKY_PASSWORD=Annrice222$
set BLUESKY_IDENTIFIER=grandcodepope.bsky.social
set BLUESKY_PASSWORD=4sqh-knbl-s3kr-s7fd
set MASTODON_ACCESS_TOKEN=PmlkpOvItUez430I_sHiUT57ZcBdIl_2R-ZGPNCkldY
set NINE_ROUTER_API_KEY=8c93f68b603e4dd4abe7024856996052.hcuBSiEk1S6U8QuZUu8AMyal
set GSK_MODEL=gc/gemini-2.5-flash
cls
echo.
echo   Starting GSK Alien Mode...
echo   Opening console windows for each subsystem view
echo.
start "GSK — Alien Console" cmd /c "title GSK — Alien & node bin\gsk-alien-mode.js & pause"
timeout /t 3 /nobreak >nul
echo.
echo   Alien Mode Launched.
echo   - Main console shows GSK runtime status
echo.
echo   Also available:
echo   - Dashboard: http://localhost:4432
echo   - SCRIBE Dashboard: http://localhost:4200
echo.
echo   Press any key to open the web dashboards...
pause >nul
start "" http://localhost:4432
start "" http://localhost:4200
echo.
echo   Dashboards opened in browser.
pause
