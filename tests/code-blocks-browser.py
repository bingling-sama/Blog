"""Run against `pnpm dev`: uv run --with playwright python tests/code-blocks-browser.py."""
import os
import pathlib
import tempfile
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parents[1]
artifact_dir = pathlib.Path(os.environ.get(
    "TMPDIR", "/private/var/folders/4g/l9zywwp15lq20pvw1_slc7xm0000gn/T"
)) / "opencode"
artifact_dir.mkdir(exist_ok=True)
fd, name = tempfile.mkstemp(prefix="code-blocks-check-", suffix=".md", dir=root / "blog/pages")
fixture = pathlib.Path(name)
code = "\n".join(f"const line{i} = {i}" for i in range(40))
body = (
    "# Code block checks\n\n"
    f"```ts{{3}} :line-numbers :collapsed-lines=5 :height=200px\n{code}\n```\n\n"
    f"```ts :height=200px\nconst short = true\n```\n\n"
    f"```ts :collapsed-lines=5\n{code}\n```\n\n"
    "::: code-group\n"
    f"```ts :height=200px [one.ts]\n{code}\n```\n"
    "```js [two.js]\nconst second = true\n```\n:::\n"
    "\n```ts\nconst a = 1 // [!code --]\nconst b = 2 // [!code ++]\n```\n"
)
try:
    with os.fdopen(fd, "w") as out:
        out.write(body)
    with sync_playwright() as p:
        # Reuse an installed browser if the current Playwright revision is absent.
        cached = sorted((pathlib.Path.home() / "Library/Caches/ms-playwright").glob(
            "chromium_headless_shell-*/chrome-headless-shell-mac-arm64/chrome-headless-shell"
        ))
        browser = p.chromium.launch(**({"executable_path": str(cached[-1])} if cached else {}))
        context = browser.new_context(viewport={"width": 1280, "height": 900},
                                      permissions=["clipboard-read", "clipboard-write"])
        context.route("**/*", lambda route: route.continue_()
                      if route.request.url.startswith("http://localhost:3000")
                      else route.abort())
        page = context.new_page()
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.goto(f"http://localhost:3000/{fixture.stem}")
        page.wait_for_load_state("networkidle")
        block = page.locator(".vp-doc .has-collapsed-lines").first
        button = block.locator("button.collapsed-lines")
        scroll = block.locator(".code-scroll")
        assert button.get_attribute("aria-expanded") == "false"
        assert block.locator(".line.highlighted").count() == 1, block.inner_html()
        button.focus()
        page.keyboard.press("Enter")
        assert button.get_attribute("aria-expanded") == "true"
        assert scroll.evaluate("(el) => el.clientHeight") == 200
        assert scroll.evaluate("(el) => el.scrollHeight > el.clientHeight")
        before = block.locator(".line-number").first.bounding_box()["y"]
        scroll.evaluate("(el) => el.scrollTop = 100")
        after = block.locator(".line-number").first.bounding_box()["y"]
        assert abs(before - after - 100) < 1
        block.hover()
        block.locator("button.copy").click()
        copied = page.evaluate("navigator.clipboard.readText()")
        assert "const line39 = 39" in copied and "展开代码" not in copied
        button.focus()
        page.keyboard.press("Space")
        assert button.get_attribute("aria-expanded") == "false"
        assert scroll.evaluate("(el) => el.scrollTop") == 0
        short = page.locator(".vp-doc .code-scroll").nth(1)
        assert short.evaluate("(el) => el.clientHeight") < 200
        assert page.locator(".vp-doc .diff.add").count() == 1
        assert page.locator(".vp-doc .diff.remove").count() == 1
        page.locator(".vp-code-group label").filter(has_text="two.js").click()
        assert page.locator(".vp-code-group .active").inner_text().find("second") >= 0
        page.locator(".vp-code-group label").filter(has_text="one.ts").click()
        for dark in [False, True]:
            page.evaluate("(dark) => document.documentElement.classList.toggle('dark', dark)", dark)
            block.scroll_into_view_if_needed()
            page.evaluate("""async () => {
                document.body.getBoundingClientRect();
                await Promise.all(document.getAnimations()
                    .filter(a => a.effect.getTiming().iterations !== Infinity)
                    .map(a => a.finished.catch(() => {})));
            }""")
            page.screenshot(path=str(artifact_dir / f"code-blocks-{'dark' if dark else 'light'}.png"))
        for width in [280, 320, 414]:
            page.set_viewport_size({"width": width, "height": 900})
            assert scroll.evaluate("(el) => el.getBoundingClientRect().right") <= width + 1
            assert scroll.evaluate("(el) => el.getBoundingClientRect().left") >= -1
        # SPA navigation must not lose delegated folding handlers.
        page.set_viewport_size({"width": 1280, "height": 900})
        page.locator(".VPNavBarTitle").click()
        page.wait_for_url("http://localhost:3000/")
        page.go_back()
        page.wait_for_load_state("networkidle")
        button = page.locator(".vp-doc button.collapsed-lines").first
        button.click()
        assert button.get_attribute("aria-expanded") == "true"
        assert not errors, errors
        print("Browser checks passed: keyboard folding, scroll/gutter, copy, code groups, diff, themes, mobile, SPA.")
        print(f"Screenshots: {artifact_dir}/code-blocks-{{light,dark}}.png")
        browser.close()
finally:
    fixture.unlink(missing_ok=True)
