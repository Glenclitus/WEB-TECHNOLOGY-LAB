const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT) || 3000;
const projectDirectory = __dirname;

let items = [
    { id: 101, name: "Canvas Boards", stock: 12 },
    { id: 102, name: "Acrylic Paint Set", stock: 5 }
];

const homePage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Online Art Supplies Store</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #fffbea; color: #333; }
        header { padding: 28px 20px; text-align: center; background: #f5d6a6; }
        main { max-width: 760px; margin: 24px auto; padding: 0 20px; }
        .card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 10px #0002; }
        form { display: flex; gap: 10px; flex-wrap: wrap; margin: 20px 0; }
        input, button { padding: 10px; border: 1px solid #bbb; border-radius: 6px; }
        input { flex: 1; min-width: 160px; }
        button { background: brown; color: white; cursor: pointer; }
        li { margin: 8px 0; }
        #message { min-height: 1.4em; color: brown; }
    </style>
</head>
<body>
    <header>
        <h1>Online Art Supplies Store</h1>
        <p>EXP_8: Node.js server-side application</p>
    </header>
    <main>
        <section class="card">
            <h2>Art Supplies Inventory</h2>
            <p>This page is served by a Node.js HTTP server and reads inventory from <code>/api/items</code>.</p>
            <form id="itemForm">
                <input id="name" name="name" placeholder="Supply name" required>
                <input id="stock" name="stock" type="number" min="0" placeholder="Stock" required>
                <button type="submit">Add Supply</button>
            </form>
            <p id="message" role="status"></p>
            <ul id="items"></ul>
        </section>
    </main>
    <script>
        const itemList = document.getElementById("items");
        const message = document.getElementById("message");

        async function loadItems() {
            const response = await fetch("/api/items");
            const result = await response.json();
            itemList.innerHTML = result.data
                .map(item => "<li><strong>" + item.name + "</strong> - " + item.stock + " in stock</li>")
                .join("");
        }

        document.getElementById("itemForm").addEventListener("submit", async event => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const response = await fetch("/api/items", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.get("name"),
                    stock: form.get("stock")
                })
            });
            const result = await response.json();
            message.textContent = result.message || (result.success ? "Supply added." : "Unable to add supply.");
            if (response.ok) {
                event.currentTarget.reset();
                await loadItems();
            }
        });

        loadItems().catch(() => {
            message.textContent = "Could not load inventory.";
        });
    </script>
</body>
</html>
`;

function sendJson(response, statusCode, payload) {
    response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
    return new Promise((resolve, reject) => {
        let body = "";

        request.on("data", chunk => {
            body += chunk;
            if (body.length > 10_000) {
                reject(new Error("Request body is too large."));
                request.destroy();
            }
        });
        request.on("end", () => resolve(body));
        request.on("error", reject);
    });
}

function serveFile(response, fileName, contentType) {
    const filePath = path.join(projectDirectory, fileName);
    const content = fs.readFileSync(filePath);
    response.writeHead(200, { "Content-Type": contentType });
    response.end(content);
}

const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    const { pathname } = requestUrl;

    console.log(`[${new Date().toLocaleTimeString()}] ${request.method} ${pathname}`);

    try {
        if (pathname === "/" && request.method === "GET") {
            serveFile(response, "index.html", "text/html; charset=utf-8");
            return;
        }

        if (pathname === "/signup.html" && request.method === "GET") {
            serveFile(response, "signup.html", "text/html; charset=utf-8");
            return;
        }

        if (pathname === "/server-dashboard" && request.method === "GET") {
            response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
            response.end(homePage);
            return;
        }

        const staticFiles = {
            "/app.js": ["app.js", "text/javascript; charset=utf-8"],
            "/validate.js": ["validate.js", "text/javascript; charset=utf-8"],
            "/art.jpg": ["art.jpg", "image/jpeg"],
            "/arts.jpg": ["arts.jpg", "image/jpeg"],
            "/art_basic.jpg": ["art_basic.jpg", "image/jpeg"],
            "/basic.webp": ["basic.webp", "image/webp"],
            "/mona_lisa.jpg": ["mona_lisa.jpg", "image/jpeg"]
        };
        if (request.method === "GET" && staticFiles[pathname]) {
            const [fileName, contentType] = staticFiles[pathname];
            serveFile(response, fileName, contentType);
            return;
        }

        if (pathname === "/api/items" && request.method === "GET") {
            sendJson(response, 200, { success: true, count: items.length, data: items });
            return;
        }

        if (pathname === "/api/items" && request.method === "POST") {
            const body = await readRequestBody(request);
            let input;

            try {
                input = JSON.parse(body);
            } catch {
                sendJson(response, 400, { success: false, message: "Request body must be valid JSON." });
                return;
            }

            const name = typeof input.name === "string" ? input.name.trim() : "";
            const stock = Number(input.stock);
            if (!name || !Number.isInteger(stock) || stock < 0) {
                sendJson(response, 400, {
                    success: false,
                    message: "Please provide a supply name and a non-negative whole-number stock count."
                });
                return;
            }

            const newItem = { id: items.length + 101, name, stock };
            items.push(newItem);
            sendJson(response, 201, { success: true, message: "Supply added.", data: newItem });
            return;
        }

        sendJson(response, 404, { success: false, message: "Resource not found." });
    } catch (error) {
        console.error("Request error:", error);
        if (!response.headersSent) {
            sendJson(response, 500, { success: false, message: "Internal server error." });
        }
    }
});

server.listen(PORT, () => {
    console.log(`Node.js server running at http://localhost:${PORT}`);
});
