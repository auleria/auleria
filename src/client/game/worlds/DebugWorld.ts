
import { GameWorld } from "../GameWorld";
import { PlayerCharacter } from "../objects/PlayerCharacter";
import { Remote } from "../../Remote";
import { Classes } from "../../Classes";
import { NetworkCode } from "../../NetworkCode";
import { ByteBuffer } from "../../ByteBuffer";
import { Input } from "../../Input";
import { QuadTreeTerrain } from "../objects/QuadTreeTerrain";

@Classes.register
export class DebugWorld extends GameWorld
{
	private point : THREE.Mesh;
	private raycaster = new THREE.Raycaster();

	public players = new Map<string, PlayerCharacter>();

	private t = 0;
	private d = 0;
	public terrain : QuadTreeTerrain;

	private click = false;

	public initialize()
	{

	}

	public masterInitialize()
	{
		console.log("Debug World created, id is", this.id, "me is", this.me);

		this.on("join", (data, playerid) => {
			let pc = new PlayerCharacter(playerid);
			this.transferOwner(pc, playerid);
			this.players.set(playerid, pc);
			this.add(pc);
		});

		this.on("left", (data, playerid) => {
			let object = this.players.get(playerid);
			this.players.delete(playerid);
			this.destroy(object);
		});
	}

	public clientInitialize()
	{
		console.log("DebugWorld created on client with id", this.id);

		let hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 2 );
		this.scene.add( hemiLight );

		let terrain = this.add(new QuadTreeTerrain());

		this.point = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({color: 0xffffff}));
		this.point.position.z = 20;
		//let pointLight = new THREE.PointLight(0xffffff, 1, 32);
		//pointLight.castShadow = true;
		//this.point.add(pointLight);
		//this.scene.add(this.point);

		let lineGeom = new THREE.Geometry();
		lineGeom.vertices.push(new THREE.Vector3(0, 0, 20));
		lineGeom.vertices.push(new THREE.Vector3(0, 0, -20));
		let line = new THREE.Line(lineGeom, new THREE.LineBasicMaterial({color: 0xff0000}));
		this.point.add(line);
		//this.scene.add(line);

		this.terrain = terrain;
	}

	public update(tickrate : number)
	{
		super.update(tickrate);
	}
}
