import { PeerJSDebugController } from "./controllers/PeerJSDebugController";
import { ByteBuffer } from "./ByteBuffer";

enum masterType {WORKER, REMOTE};

export class GameMaster
{
	public static masterType = masterType;

	private type : masterType;
	private worker : Worker;
	private messageListener : Function;
	private clients = new Map<string, any>();
	private connection : any;
	private myid : string;

	public static CreateFromWorker(peer : any)
	{
		let gm = new GameMaster(masterType.WORKER, peer);
		return gm;
	}

	public static CreateFromHost(peer : any, hostid : string)
	{
		let gm = new GameMaster(masterType.REMOTE, peer, hostid);
		return gm;
	}

	constructor(type : masterType, peer : any, hostid? : string)
	{
		this.type = type;
		this.myid = peer.id;
		if (type === masterType.WORKER)
		{
			this.worker = new Worker("/bin/bundle.js");
			this.worker.onmessage = event => this.handleMessage(event);
			peer.on("connection", (connection:any) => this.onClientConnected(connection));
		}
		else
		{
			this.connectTo(peer, hostid);
		}
	}

	public setListener(func : (buffer: ByteBuffer, client? : string) => void)
	{
		this.messageListener = func;
	}

	//Sends data to the WORKER, either passing data from a client or from a slave
	public sendMessage(buffer : ByteBuffer, clientid? : string)
	{
		let trimmed = buffer.getTrimmedBuffer();
		if (this.type === masterType.WORKER)
		{
			this.worker.postMessage({data : trimmed, clientid}, [trimmed] as any);
		}
		else
		{
			this.connection.send(trimmed);
		}
	}

	private onClientConnected(connection: any)
	{
		console.log(connection.peer, "connected");
		this.clients.set(connection.peer, connection);
		connection.on("data", (event : any) => this.handleClientMessage({data: {data: event}, peer: connection.peer}));
	}

	private handleClientMessage(message : any)
	{
		let buffer = new ByteBuffer(message.data.data);
		let client = message.peer || false;
		this.sendMessage(buffer, client);
	}

	//Handle message comming from Worker/RemoteHost
	private handleMessage(message : any)
	{
		let buffer = new ByteBuffer(message.data.data);
		let client = message.peer;

		if (this.type === masterType.WORKER)
		{
			if (!client)
			{
				for (let [client, connection] of this.clients)
				{
					connection.send(message.data.data);
					console.log("Sending to", client);
				}
			}
		}

		this.messageListener(buffer, client);
	}

	private connectTo(peer : any, host : string)
	{
		let connection = peer.connect(host);
		this.connection = connection;
		connection.once("open", () => {
			console.log("Connected");
			connection.on("data", (data : any) => this.handleMessage({data: {data: data}}));
		});
	}
}
