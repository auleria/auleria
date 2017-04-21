
import { GameWorld } from "../GameWorld";
import { DebugObject } from "../objects/DebugObject";
import { Remote } from "../../Remote";
import { Classes } from "../../Classes";
import { NetworkCode } from "../../NetworkCode";
import { ByteBuffer } from "../../ByteBuffer";
import { DebugTerrain } from "../objects/DebugTerrain";
import { Input } from "../../Input";

@Classes.register
export class DebugWorld extends GameWorld
{
	private point : THREE.Mesh;
	private raycaster = new THREE.Raycaster();

	public players = new Map<string, DebugObject>();

	public initialize()
	{
		if (this.isMaster)
		{
			console.log("Debug World created, id is", this.id, "me is", this.me);

			this.on("join", (data, playerid) => {
				this.add(new DebugObject(playerid));
			});

			this.on("left", (data, playerid) => {
				let object = this.players.get(playerid);
				this.players.delete(playerid);
				this.destroy(object);
			});
		}
		else
		{
			console.log("DebugWorld created on client with id", this.id);
			this.mainCamera.position.z = 2;
			this.mainCamera.position.y = -2;

			let hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 2 );
			this.scene.add( hemiLight );

			this.mainCamera.lookAt(new THREE.Vector3(0,0,0));
		}
	}

	public clientInitialize()
	{
		console.log("creating debug terrain");
		let time = Date.now();
		// tslint:disable-next-line:curly
		for (let y = 0; y < 5; y++)
		for (let x = 0; x < 5; x++)
		{
			this.add(new DebugTerrain(x - 2.5, y - 2.5));
		}
		let result =  Date.now() - time;
		console.log("Time(ms):", result);
		console.log("Time per chunk(ms):", result / 25);

		this.point = new THREE.Mesh(new THREE.SphereGeometry(0.02), new THREE.MeshBasicMaterial({color: 0xffffff}));
		let pointLight = new THREE.PointLight(0xffffff, 1.5, 0.3);
		this.point.add(pointLight);
		this.scene.add(this.point);
	}

	public update()
	{
		super.update();
		let mouse = {x: (Input.mouse.x / window.innerWidth) * 2 - 1, y: - (Input.mouse.y / window.innerHeight) * 2 + 1};
		this.raycaster.setFromCamera(mouse, this.mainCamera);
		let hits = this.raycaster.intersectObjects( this.scene.children );
		let hit = hits.find(obj => obj.object.name === "terrain");
		if (hit)
		{
			this.point.position.x = hit.point.x - hit.face.normal.x * 0.02;
			this.point.position.y = hit.point.y - hit.face.normal.y * 0.02;
			this.point.position.z = hit.point.z - hit.face.normal.z * 0.02;
		}
	}
}
