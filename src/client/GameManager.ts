
import { Helper } from "./Helper";
import { NetworkInterface } from "./NetworkInterface";
import { DebugWorld } from "./game/worlds/DebugWorld";
import { GameWorld } from "./game/GameWorld";
import { IMessage } from "./IMessage";
import { ByteBuffer } from "./ByteBuffer";
import { Classes } from "./Classes";
import { NetworkHub } from "./NetworkHub";
import { Tween } from "./Tween";
import { Commands } from "./Commands";
import { StatsHandler } from "./StatsHandler";
import { Profiler } from "./Profiler";

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

	private mainRenderer : THREE.WebGLRenderer;
	private subRenderers = new Map<string, THREE.WebGLRenderTarget>();

	private lastTick = 0;

	public get canvas() { return this.mainRenderer.domElement; }

	constructor()
	{
		this.mainRenderer = new THREE.WebGLRenderer({antialias: true});
		this.mainRenderer.shadowMap.enabled = true;
		this.mainRenderer.setSize(window.innerWidth, window.innerHeight);
		window.addEventListener("resize", () => {
			this.mainRenderer.setSize(window.innerWidth, window.innerHeight);
			(this.mainRenderer as any).needsUpdate = true;
		});
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

		this.hub.addInterface(workerInterface);
		//Add both the world and the worker to the maps, using the world id as key for both
		this.networkInterfaces.set(world.id, workerInterface);
		this.worlds.set(world.id, world);

		//Tell the worker to create a new world with the same type and id as the world we just created
		let worlddata = await workerInterface.request("create world", {worldId: world.id, worldType: world.constructor.name});
		world.readFromBuffer(new ByteBuffer(worlddata.buffer));
		world.externalInitialize();
		let trimmed = world.getBuffer().getTrimmedBuffer();
		if (trimmed.byteLength > 0) {
			workerInterface.post("world data", {buffer: trimmed}, [trimmed]);
			world.setBuffer(new ByteBuffer());
		}
		world.isInitialized = true;

		Commands.register("tickrate", (tickrate : any) => {
			workerInterface.post("set tickrate", tickrate);
			Tween.tickrate = 60 / tickrate;
		});

		return world;
	}

	public setMainWorld(world : GameWorld)
	{
		world.setRenderer(this.mainRenderer);
		world.setAspect(window.innerWidth / window.innerHeight);
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
					if (data.buffer.byteLength > 0) {
						this.peers.forEach(peer => peer.networkInterface.post("world data", data));
					}
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
			answer({worlds: worlds});
		});

		this.hub.on("world meta", (worldID, sender, answer) => {
			let world = this.worlds.get(worldID);
			answer({id: world.id, type: world.constructor.name});
		});

		this.hub.on("handshake", (data, sender, answer) => {
			answer("hello");
		});

		this.hub.on("join world", async (worldID, sender, answer) => {
			let world = this.worlds.get(worldID);
			if (world && world.isOwner)
			{
				let worldInterface = this.networkInterfaces.get(worldID);
				answer(await worldInterface.request("join", {id: sender.peerID}));
			}
			else
			{
				answer(false);
			}
		});

		this.hub.on("full world sync", async (worldID, sender, answer) => {
			let world = this.worlds.get(worldID);
			let worldInterface = this.networkInterfaces.get(worldID);
			let worldBuffer = (await worldInterface.request("get world data")).buffer;
			answer({
				id : world.id,
				type: world.constructor.name,
				owner: this.peer.id,
				buffer: worldBuffer.byteLength > 0 ? worldBuffer : new ArrayBuffer(1)
			}, [worldBuffer]);
		});

		this.hub.on("disconnect", (data, sender) => {
			this.worlds.forEach((world, id) => {
				if (world.isOwner)
				{
					this.networkInterfaces.get(id).post("leave", {id: sender.peerID});
				}
			});
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
			let allowed = await peer.request("join world", id);
			if (allowed)
			{
				let worlddata = await peer.request("full world sync", id);
				let worldType = Classes.getClass(worlddata.type);
				let world = new worldType(id, worlddata.owner, false, false, this.peer.id) as GameWorld;
				world.setBuffer(new ByteBuffer());
				world.readFromBuffer(new ByteBuffer(worlddata.buffer));
				world.externalInitialize();
				let trimmed = world.getBuffer().getTrimmedBuffer();
				if (trimmed.byteLength > 0) {
					peer.post("world data passthrough", {buffer: trimmed, id: world.id}, [trimmed]);
				}
				world.isInitialized = true;
				this.worlds.set(world.id, world);
				this.networkInterfaces.set(world.id, peer);
				resolve(world);
			}
			else
			{
				reject("You may not join this world.");
			}

		});
	}

	private update()
	{
		requestAnimationFrame(() => this.update());
		StatsHandler.begin();
		Profiler.begin("update");

		let timescale = 1 / (this.lastTick - Date.now());

		Tween.update();
		this.worlds.forEach(world => {
			if (!world.isInitialized) { return; }
			world.update(timescale);
			world.writeToBuffer();
			world.postUpdate();

			let trimmed = world.getBuffer().getTrimmedBuffer();

			if (world.isOwner)
			{
				if (trimmed.byteLength > 0) {
					this.networkInterfaces.get(world.id).post("world data", {worldId: world.id, buffer: trimmed}, [trimmed]);
				}
			}
			else
			{
				if (trimmed.byteLength > 0)
				{
					this.networkInterfaces.get(world.id).post("world data passthrough", {id: world.id, buffer: trimmed}, [trimmed]);
				}
			}

			world.setBuffer(new ByteBuffer());
			world.render();
		});

		Profiler.end();
		StatsHandler.end();

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
