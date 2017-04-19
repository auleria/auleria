
import { Helper } from "./Helper";
import { NetworkInterface } from "./NetworkInterface";
import { DebugWorld } from "./game/worlds/DebugWorld";
import { GameWorld } from "./game/GameWorld";
import { IMessage } from "./IMessage";
import { ByteBuffer } from "./ByteBuffer";
import { Classes } from "./Classes";
import { NetworkHub } from "./NetworkHub";

declare let Peer: any;

export class GameManager
{
	private peer : any;
	private worlds = new Map<string, GameWorld>();
	private worldWorkers = new Map<string, Worker>();

	private networkInterfaces = new Map<string, NetworkInterface>();
	private peers = new Map<string, {isReady: boolean, networkInterface: NetworkInterface}>();

	private peerWorlds = new Map<string, {id :string, type:string}[]>();
	private hub = new NetworkHub();

	constructor()
	{
		this.setupHub();
		this.update();
	}

	public async createWorld()
	{
		//Create the new world, make sure it's not a master
		let world = new DebugWorld(null, this.peer.peer, true, false, this.peer.id);

		//Create a new worker
		let worldWorker = new Worker("/bundle.js");

		let workerInterface = new NetworkInterface(worldWorker);

		//Tell the worker who we are
		workerInterface.post("set me", this.peer.id);

		//Tell the worker to create a new world with the same type and id as the world we just created
		workerInterface.post("create world", {worldId: world.id, worldType: world.constructor.name});

		this.hub.addInterface(workerInterface);
		//Add both the world and the worker to the maps, using the world id as key for both
		this.networkInterfaces.set(world.id, workerInterface);
		this.worlds.set(world.id, world);

		return world;
	}

	public setupHub()
	{
		this.hub.on("world data", (data, sender, answer) => {
			let world = this.worlds.get(data.id);
			if (world)
			{
				world.readFromBuffer(new ByteBuffer(data.buffer));

				if (world.isOwner)
				{
					this.peers.forEach(peer => peer.networkInterface.post("world data", data));
				}
			}
		});

		this.hub.on("world data passthrough", (data, sender, answer) => {
			let world = this.worlds.get(data.id);
			if (world)
			{
				this.networkInterfaces.get(world.id).post("world data", data, [data.buffer]);
			}
		});

		this.hub.on("worlds", (data, sender, answer) => {
			let worlds = Array.from(this.worlds.keys());
			console.log(worlds);
			answer({worlds: worlds});
		});

		this.hub.on("world meta", (worldID, sender, answer) => {
			let world = this.worlds.get(worldID);
			answer({id: world.id, type: world.constructor.name});
		});

		this.hub.on("handshake", (data, sender, answer) => {
			answer("hello");
		});

		this.hub.on("full world sync", async (worldID, sender, answer) => {
			console.log("someone requested a full world sync");
			let world = this.worlds.get(worldID);
			let worldInterface = this.networkInterfaces.get(worldID);
			let worldBuffer = (await worldInterface.request("get world data")).buffer;
			answer({
				id : world.id,
				type: world.constructor.name,
				owner: this.peer.id,
				buffer: worldBuffer
			}, [worldBuffer]);
		});
	}

	public async connectToRemote(host : string) : Promise<NetworkInterface>
	{
		return new Promise<NetworkInterface>((resolve, reject) => {
			let connection = this.peer.connect(host);
			connection.once("open", async () => {
				let peerInterface = new NetworkInterface(connection);
				await peerInterface.request("handshake", null);
				console.log("Connected to", connection.peer);
				this.hub.addInterface(peerInterface);
				resolve(peerInterface);
			});
		});
	}

	public async openWorld(peer : NetworkInterface, id : string)
	{
		return new Promise<GameWorld>(async (resolve, reject) => {
			console.log("requesting full sync of world", id);
			let worlddata = await peer.request("full world sync", id);
			let worldType = Classes.getClass(worlddata.type);
			let world = new worldType(id, worlddata.owner, false, false, this.peer.id) as GameWorld;
			world.readFromBuffer(new ByteBuffer(worlddata.buffer));
			world.initialize();
			this.worlds.set(world.id, world);
			this.networkInterfaces.set(world.id, peer);
			resolve(world);
		});
	}

	public handleMessage(message : any, connection? : any)
	{
		//What world is this message aimed at?
		let id = message.worldId;
		let world = this.worlds.get(id);

		//What kind of data is this?
		switch (message.messagetype)
		{
			case "worlddata":
				//If it is world data we want the world to handle it
				world.readFromBuffer(new ByteBuffer(message.buffer));
				if (world.isOwner) {
					this.peers.forEach((peer, id) => {
						if (peer.isReady)
						{
							// peer.connection.send(message);
						}
					});
				}
				break;
			case "clientworlddata":
				//If it is world data we want the world to handle it
				this.worldWorkers.get(world.id).postMessage({messagetype: "worlddata", worldId: world.id, buffer: message.buffer}, [message.buffer]);
				break;
			case "getworldcreationdata":
				//A new world needs all the creationdata for it's current objects
				let tmpBuffer = world.getBuffer();
				let buffer = new ByteBuffer();
				this.worlds.get(id).setBuffer(buffer);
				this.worlds.get(id).writeCreationData(buffer);
				this.worlds.get(id).setBuffer(tmpBuffer);
				connection.send({messagetype: "worlddata", worldId: id, buffer: buffer.getTrimmedBuffer()});
				this.peers.get(connection.peer).isReady = true;
				break;
			case "updateremoteworldlist":
				//What worlds are hosted on the remote computer?
				this.updateRemoteWorldList(connection, message);
				break;
			case "gethostedworlds":
				//What worlds are hosted on this computer?
				connection.send({
					messagetype: "updateremoteworldlist",
					worlds: Array.from(this.worldWorkers.keys()).map(id => ({id: id, type: this.worlds.get(id).constructor.name}))
				});
				break;
			default:
				console.warn("unknown messagetype", message);
				break;
		}
	}

	private update()
	{
		requestAnimationFrame(() => this.update());

		this.worlds.forEach(world => {
			let buffer = new ByteBuffer();
			world.setBuffer(buffer);
			world.update();
			world.writeToBuffer();
			world.postUpdate();
			let trimmed = buffer.getTrimmedBuffer();

			if (world.isOwner)
			{
				this.networkInterfaces.get(world.id).post("world data", {worldId: world.id, buffer: trimmed}, [trimmed]);
			}
			else
			{
				if (trimmed.byteLength > 0)
				{
					this.networkInterfaces.get(world.id).post("world data passthrough", {id: world.id, buffer: trimmed}, [trimmed]);
				}
			}
		});
	}

	private updateRemoteWorldList(connection : any, message : any)
	{
		let worlds = message.worlds;
		this.peerWorlds.set(connection.peer, worlds);

		let worldType = Classes.getClass(worlds[0].type);
		let world = new worldType(worlds[0].id, connection.peer, false, false, this.peer.id);
		this.worlds.set(worlds[0].id, world);

		connection.send({messagetype: "getworldcreationdata", worldId: world.id});
	}

	//Prepare peerjs
	public async prepareNetwork(requestedID : string = Helper.generateID())
	{
		return new Promise<any>((resolve) => {
			let peer = new Peer(requestedID, {
				host: location.hostname,
				port: location.port,
				path: "/broker"
			});
			this.peer = peer;
			peer.on("open", (id : any) => resolve());
			peer.on("connection", (connection : any) => this.handleNewRemoteConnection(connection));
		});
	}

	public handleNewRemoteConnection(connection : any)
	{
		console.log(connection.peer, "connected");
		let peerInterface = new NetworkInterface(connection);
		this.hub.addInterface(peerInterface);
		this.peers.set(connection.peer, {isReady : false, networkInterface : peerInterface});
	}
}
