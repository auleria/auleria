import * as express from "express";

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

app.use((req, res, next) => {
	res.status(404).render("error", {
		title: "Error: 404",
		statusCode: 404,
		message: "Not found."
	});
});

app.listen(9080, null, () => {
	console.log("Server is up and running, listening to port", 9080);
});
