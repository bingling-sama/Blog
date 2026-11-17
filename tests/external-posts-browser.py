"""Production-output regression. Run through pnpm test:external-posts."""
import functools
import http.server
import pathlib
import sys
import threading
from urllib.parse import urlsplit

from playwright.sync_api import sync_playwright

slug, base, artifacts = sys.argv[1:]
dist = pathlib.Path(".vitepress/dist").resolve()


class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, requested):
        route = urlsplit(requested).path
        if not route.startswith(base):
            return str(dist / "not-found")
        relative = route[len(base):]
        resolved = pathlib.Path(super().translate_path("/" + relative))
        if not resolved.exists() and resolved.with_suffix(".html").is_file():
            resolved = resolved.with_suffix(".html")
        return str(resolved)

    def log_message(self, *_):
        pass


server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Handler, directory=str(dist)))
thread = threading.Thread(target=server.serve_forever, daemon=True)
thread.start()
origin = f"http://127.0.0.1:{server.server_port}"
external_url = "https://example.com/article?x=1&y=2#section"
record = f"{base}posts/{slug}/empty"

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    def route_request(route):
        host = urlsplit(route.request.url).hostname
        if host == "127.0.0.1":
            route.continue_()
        elif host == "example.com":
            route.fulfill(body="<h1>Original article fixture</h1>", content_type="text/html")
        else:
            # Do not send test visits to the production counter or other services.
            route.abort()

    context.route("**/*", route_request)
    page = context.new_page()
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))

    def visit(route):
        page.goto(origin + route)
        page.wait_for_load_state("networkidle")

    def external_link(title="外链验收：一篇值得读的文章"):
        link = page.get_by_role("link", name=title, exact=False).first
        link.wait_for()
        assert link.get_attribute("href") == external_url
        assert link.get_attribute("target") == "_blank"
        assert set(link.get_attribute("rel").split()) >= {"noopener", "noreferrer"}
        assert "推荐阅读" in link.inner_text()
        assert "将在新标签页打开" in link.inner_text()
        return link

    def settle():
        page.evaluate("() => Promise.allSettled(document.getAnimations().filter(a => a.effect?.getTiming().iterations !== Infinity).map(a => a.finished))")

    def contrast(locator):
        return locator.evaluate("""el => {
            const rgb = color => color.match(/[\\d.]+/g).map(Number);
            const over = (fg, bg) => fg.slice(0, 3).map((c, i) => c * (fg[3] ?? 1) + bg[i] * (1 - (fg[3] ?? 1)));
            const ancestors = []; for (let node = el; node; node = node.parentElement) ancestors.unshift(node);
            let bg = [255, 255, 255];
            for (const node of ancestors) bg = over(rgb(getComputedStyle(node).backgroundColor), bg);
            const fg = over(rgb(getComputedStyle(el).color), bg);
            const luminance = color => color.map(c => c / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0);
            const [a, b] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
            return (a + .05) / (b + .05);
        }""")

    visit(base)
    link = external_link()
    card = page.locator(".post-list").filter(has=link)
    assert "原作者：原作者 <A> & B" in card.inner_text()
    assert "本站推荐语 <不是 HTML> & 案例分析。" in card.inner_text()
    assert card.locator(".post-reading-time").count() == 0
    ordinary = page.get_by_role("link", name="普通文章验收", exact=True)
    assert ordinary.get_attribute("href") == f"{base}posts/{slug}/ordinary"
    assert ordinary.get_attribute("target") is None
    assert page.locator(".post-list").filter(has=ordinary).locator(".post-reading-time").count() == 1
    with context.expect_page() as popup_info:
        link.focus()
        assert link.evaluate("node => node === document.activeElement")
        page.keyboard.press("Enter")
    popup = popup_info.value
    popup.wait_for_load_state()
    assert popup.url == external_url
    assert popup.evaluate("window.opener === null")
    popup.close()
    assert page.url == origin + base

    card.get_by_role("link", name="ExternalTest", exact=True).click()
    page.wait_for_url("**/tags?tag=ExternalTest")
    external_link()
    assert "ExternalTest 3" in page.locator(".tags").inner_text()
    for route in [base + "archives", base + "category", base + "tags?tag=ExternalTest"]:
        visit(route)
        link = external_link()
        ordinary = page.get_by_role("link", name="普通文章验收", exact=True)
        for item in [link, ordinary]:
            style = item.evaluate("""el => {
                const s = getComputedStyle(el);
                return { weight: s.fontWeight, border: s.borderBottomWidth, decoration: s.textDecorationLine };
            }""")
            assert style == {"weight": "400", "border": "0px", "decoration": "none"}, (route, style)
        assert link.locator(".recommendation-mark > span").first.evaluate(
            "el => getComputedStyle(el).position"
        ) == "absolute"
        assert link.locator(".recommendation-mark svg").is_visible()
    print("PASS homepage/archive/category/tag links, counts, metadata, keyboard popup and safe opener")

    visit(record)
    assert page.locator(".vp-doc h1").count() == 1
    assert page.locator(".external-post-record").count() == 1
    assert page.get_by_role("heading", level=1).filter(has_text="外链验收：一篇值得读的文章").count() == 1
    assert page.locator(".post-reading-time").count() == 0
    assert "本页访问量" in page.locator(".post-meta").inner_text()
    assert "2099-11-13" in page.locator(".post-meta").inner_text()
    assert "example.com" in page.locator(".external-post-record").inner_text()
    assert "原文版权归原作者所有" in page.locator(".external-post-record").inner_text()
    assert external_link("阅读原文").count() == 1
    assert page.url == origin + record

    visit(f"{base}posts/{slug}/comments")
    assert page.locator(".vp-doc h1").count() == 1
    assert "这是本站作者的补充评论" in page.locator(".vp-doc").inner_text()
    assert "原作者：" not in page.locator(".external-post-record").inner_text()
    print("PASS empty-body fallback, comment body, single H1, missing author and record-only visit metrics")

    visit(base)
    page.get_by_role("button", name="Search K", exact=True).click()
    page.locator("#localsearch-input").fill("外链验收")
    result = page.locator(f'.result[href^="{record}"]')
    result.first.wait_for()
    result.first.click()
    page.wait_for_url(f"**{record}*")
    page.locator(".external-post-record").wait_for()
    assert page.locator(".external-post-record").count() == 1
    print("PASS local search finds a metadata-only recommendation and opens its local record")

    for theme in ["light", "dark"]:
        page.emulate_media(color_scheme=theme)
        for width in [280, 320, 414, 1280]:
            page.set_viewport_size({"width": width, "height": 900})
            for route in [base, base + "archives", base + "category", base + "tags?tag=ExternalTest", record]:
                visit(route)
                assert page.locator("html").evaluate("node => node.classList.contains('dark')") == (theme == "dark")
                settle()
                overflow = page.evaluate("""() => [...document.querySelectorAll('body *')].filter(el => {
                    const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1)
                }).map(el => ({tag: el.tagName, class: el.className, width: el.getBoundingClientRect().width, text: el.textContent.slice(0, 70)})).slice(0, 20)""")
                assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), (theme, width, route, overflow)
                target = external_link("阅读原文" if route == record else "外链验收：一篇值得读的文章")
                target.scroll_into_view_if_needed()
                assert target.is_visible()
                if width == 1280:
                    for state in ["default", "hover", "focus", "active"]:
                        if state == "hover":
                            target.hover()
                        elif state == "focus":
                            target.focus()
                            page.keyboard.press("Shift")
                            assert target.evaluate("node => getComputedStyle(node).outlineStyle") != "none"
                        elif state == "active":
                            target.hover()
                            page.mouse.down()
                        settle()
                        assert contrast(target) >= 4.5, (theme, route, state, contrast(target))
                        assert contrast(target.locator(".recommendation-mark")) >= 4.5
                        if state == "active":
                            page.mouse.move(0, 0)
                            page.mouse.up()
                    target.blur()
                    settle()
                if width in [320, 1280]:
                    label = "record" if route == record else ("home" if route == base else urlsplit(route).path.rsplit("/", 1)[-1])
                    page.screenshot(path=str(pathlib.Path(artifacts) / f"{base.strip('/') or 'root'}-{label}-{theme}-{width}.png"))
    assert not errors, errors
    print("PASS 40 responsive/theme route checks (280/320/414/1280px), link/badge contrast >= 4.5 in default/hover/focus/active, screenshots and no page errors")
    browser.close()

server.shutdown()
