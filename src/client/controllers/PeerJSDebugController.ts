import * as ejs from "ejs";

export class PeerJSDebugController
{
	private peer : any;
	private div : HTMLDivElement;
	constructor(peer : any)
	{
		this.peer = peer;
	}

	public async show()
	{
		let template = await fetch("/views/PeerJSDebug.ejs").then(response => response.text());
		let div = document.createElement("div");
		let clients =  await fetch("/clients").then(r => r.text());
		let clientParsed = JSON.parse(clients).filter((id:string) => id !== this.peer.id);
		div.innerHTML = ejs.render(template, {
			clients: clientParsed
		});
		document.body.appendChild(div);

		(div.querySelector("[name=connect]") as HTMLButtonElement).onclick = () => this.connect((div.querySelector("[name=clients]") as HTMLSelectElement).value);

		this.div = div;
	}

	private connect(id : string)
	{
		let connection = this.peer.connect(id);
		connection.on("open", () => console.log("Connected to", id));
	}

	public destroy()
	{
		this.div.parentElement.removeChild(this.div);
	}
}
