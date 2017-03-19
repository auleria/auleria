import * as express from "express";
import * as http from "http";
let ExpressPeerServer = require("peer").ExpressPeerServer;

let title = "Hej";
const app = express();

app.set("view engine", "ejs");
app.use("/bin", express.static("bin/client"));
app.use("/content", express.static("content"));

app.get("/", (req, res) => {
	res.render("index", {
		title: title
	});
});

let server = http.createServer(app);

let peerServer = ExpressPeerServer(server, {debug: true});
app.use("/broker", peerServer);

let peers = new Map<string, boolean>();

peerServer.on("connection", (id : string) => {
	peers.set(id, true);
});

peerServer.on("disconnect", (id : string) => {
	peers.delete(id);
});

app.get("/clients", (req, res) => {
	res.send(Array.from(peers.keys()));
});

server.listen(9080, () => {
	console.log("Server is up and running on port", 9080);
});

app.use((req, res, next) => {
	res.status(404).render("error", {
		title: "Error: 404",
		statusCode: 404,
		message: "Not found."
	});
});
