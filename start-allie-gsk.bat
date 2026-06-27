@cd /d "C:\Users\uncom\Desktop\allie"
@set ALLIE_API_KEY=allie-test-key-2026

:: Source Bluesky/Mastodon credentials from soul-bluesky-bot
@if exist "C:\Users\uncom\Desktop\soul-bluesky-bot\.env" (
    @for /f "usebackq tokens=*" %%a in ("C:\Users\uncom\Desktop\soul-bluesky-bot\.env") do @set "%%a"
)

@start "" node "bin\allie.js" --daemon --port 4430 --data-dir .allie-brain-v2 > "logs\allie-daemon.log" 2>&1
