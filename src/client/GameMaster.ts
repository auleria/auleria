import {PeerJSDebugController} from "./controllers/PeerJSDebugController";

let randtoken = require("rand-token");

enum masterType {WORKER, REMOTE};
declare let Peer : any;

export class GameMaster
{
	public static masterType = masterType;

	private type : masterType;
	private worker : Worker;

	public static CreateFromWorker()
	{
		let gm = new GameMaster(masterType.WORKER);
		return gm;
	}

	public static CreateFromHost()
	{
		let gm = new GameMaster(masterType.REMOTE);
		return gm;
	}

	constructor(type : masterType)
	{

		let peer = new Peer(randtoken.generate(8), {
			host: location.hostname,
			port: location.port,
			path: "/broker"
		});

		peer.on("open", (id : any) => {
			console.log("connection open, id got:", id);

			peer.on("connection", (connection:any) => this.onClientConnected(connection));
		});

		(new PeerJSDebugController(peer)).show();

		this.type = type;
		if (type === masterType.WORKER)
		{
			this.worker = new Worker("/bin/bundle.js");
			this.worker.onmessage = event => this.handleMessage(event);
		}
		else
		{
			
		}
	}

	private onClientConnected(connection: any)
	{
		console.log("Someone connected! Their id is", connection.peer);
	}

	private handleMessage(event : MessageEvent)
	{

	}
}
